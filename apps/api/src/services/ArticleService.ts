import { ArticleRepository } from '../repositories/ArticleRepository';
import { ProjectService } from './ProjectService';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import latex from 'node-latex';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fsPromises from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export class ArticleService {
  constructor(
    private articleRepo: ArticleRepository,
    private projectService: ProjectService,
    private documentRepo: DocumentRepository
  ) {}

  async create(projectId: string, userId: string, title: string) {
    await this.projectService.get(projectId, userId);
    
    // Template inicial LaTeX
    const initialTemplate = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{cite}

\\title{${title}}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
Your abstract here.
\\end{abstract}

\\section{Introduction}
Write your introduction here.

\\section{Literature Review}
Review of related work.

\\section{Methodology}
Describe your methodology.

\\section{Results}
Present your findings.

\\section{Discussion}
Discuss your results.

\\section{Conclusion}
Conclude your work.

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`;

    return await this.articleRepo.create({
      projectId,
      title,
      latexContent: initialTemplate,
      createdBy: userId,
    });
  }

  async get(id: string, userId: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) throw new NotFoundError('Article not found');
    
    // Garantir que projectId seja sempre uma string
    const projectId = typeof article.projectId === 'string' 
      ? article.projectId 
      : article.projectId.toString();
    
    await this.projectService.get(projectId, userId);
    
    return article;
  }

  async listByProject(projectId: string, userId: string) {
    await this.projectService.get(projectId, userId);
    return await this.articleRepo.findByProjectId(projectId);
  }

  async update(id: string, userId: string, latexContent: string) {
    const article = await this.get(id, userId);
    return await this.articleRepo.update(id, { latexContent });
  }

  async delete(id: string, userId: string) {
    await this.get(id, userId);
    return await this.articleRepo.delete(id);
  }

  async generateBibliography(projectId: string, userId: string) {
    await this.projectService.get(projectId, userId);
    
    const documents = await this.documentRepo.findByProjectId(projectId);
    
    let bibliography = '';
    documents.forEach((doc, index) => {
      if (doc.bibtex) {
        bibliography += doc.bibtex + '\n\n';
      } else {
        // Gerar BibTeX básico se não existir
        bibliography += `@article{doc${index + 1},
  title={${doc.title}},
  year={${new Date(doc.createdAt).getFullYear()}},
  note={Document ID: ${doc._id}}
}\n\n`;
      }
    });
    
    return bibliography;
  }

  async compile(id: string, userId: string): Promise<Buffer> {
    const article = await this.get(id, userId);
    
    // Tentar compilação local primeiro
    try {
      return await this.compileLocally(article.latexContent, id);
    } catch (localError) {
      logger.warn({ localError, articleId: id }, 'Local compilation failed, trying online service');
      
      // Se falhar, usar serviço online
      try {
        return await this.compileOnline(article.latexContent, id);
      } catch (onlineError) {
        logger.error({ onlineError, articleId: id }, 'Online compilation also failed');
        throw new Error('LaTeX compilation failed. Please check your syntax or install LaTeX on the server.');
      }
    }
  }

  private async compileLocally(latexContent: string, articleId: string): Promise<Buffer> {
    // Verificar se pdflatex está instalado
    try {
      await execAsync('pdflatex --version');
    } catch (error) {
      throw new Error('pdflatex not installed');
    }

    // Criar diretório temporário
    const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'latex-'));
    const texFile = path.join(tmpDir, 'document.tex');
    const pdfFile = path.join(tmpDir, 'document.pdf');

    try {
      // Escrever arquivo .tex
      await fs.writeFile(texFile, latexContent);

      // Compilar (executar duas vezes para resolver referências)
      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texFile}"`, {
        cwd: tmpDir,
        timeout: 30000, // 30 segundos timeout
      });

      // Segunda passagem
      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texFile}"`, {
        cwd: tmpDir,
        timeout: 30000,
      });

      // Ler PDF gerado
      const pdfBuffer = await fsPromises.readFile(pdfFile);

      // Atualizar registro
      await this.articleRepo.update(articleId, {
        compiledPdf: `compiled-${articleId}.pdf`,
      });

      logger.info({ articleId }, 'LaTeX compiled successfully (local)');
      return pdfBuffer;

    } finally {
      // Limpar arquivos temporários
      try {
        await fsPromises.rm(tmpDir, { recursive: true, force: true });
      } catch (cleanupError) {
        logger.warn({ cleanupError, tmpDir }, 'Failed to cleanup temp directory');
      }
    }
  }

  private async compileOnline(latexContent: string, articleId: string): Promise<Buffer> {
    // Usar API do latexonline.cc
    const https = require('https');
    
    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        text: latexContent,
        command: 'pdflatex',
      }).toString();

      const options = {
        hostname: 'latexonline.cc',
        path: '/compile',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 60000, // 60 segundos
      };

      const req = https.request(options, (res: any) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          
          if (res.statusCode !== 200) {
            reject(new Error(`Online compilation failed with status ${res.statusCode}`));
            return;
          }

          // Atualizar registro
          this.articleRepo.update(articleId, {
            compiledPdf: `compiled-${articleId}.pdf`,
          }).catch(err => logger.error({ err }, 'Failed to update article'));

          logger.info({ articleId }, 'LaTeX compiled successfully (online)');
          resolve(buffer);
        });
      });

      req.on('error', (error: Error) => {
        logger.error({ error, articleId }, 'Online compilation request error');
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Online compilation timeout'));
      });

      req.write(postData);
      req.end();
    });
  }
}
