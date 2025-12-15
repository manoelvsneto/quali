import { env } from '../config/env';
import { UserRepository } from './UserRepository';
import { ProjectRepository } from './ProjectRepository';
import { DocumentRepository } from './DocumentRepository';
import { CodeRepository } from './CodeRepository';
import { QuotationRepository } from './QuotationRepository';
import { MemoRepository } from './MemoRepository';

export class RepositoryFactory {
  static createUserRepository() {
    return env.dbType === 'sqlite' ? new UserRepository() : new UserRepository();
  }

  static createProjectRepository() {
    return env.dbType === 'sqlite' ? new ProjectRepository() : new ProjectRepository();
  }

  static createDocumentRepository() {
    return env.dbType === 'sqlite' ? new DocumentRepository() : new DocumentRepository();
  }

  static createCodeRepository() {
    return env.dbType === 'sqlite' ? new CodeRepository() : new CodeRepository();
  }

  static createQuotationRepository() {
    return env.dbType === 'sqlite' ? new QuotationRepository() : new QuotationRepository();
  }

  static createMemoRepository() {
    return env.dbType === 'sqlite' ? new MemoRepository() : new MemoRepository();
  }
}
