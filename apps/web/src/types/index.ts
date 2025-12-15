export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Author {
  name: string;
  affiliation?: string;
  email?: string;
  orcid?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  memberIds: string[];
  createdBy: string;
  authors?: Author[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  projectId: string;
  title: string;
  type: string;
  originalFilename: string;
  textContent: string;
  uploadPath: string;
  metadata: Record<string, any>;
  bibtex?: string; // Novo campo
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  projectId: string;
  name: string;
  parentId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Code {
  _id: string;
  projectId: string;
  name: string;
  color: string;
  description?: string;
  categoryId?: Category;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  _id: string;
  projectId: string;
  documentId: string | Document;
  startOffset: number;
  endOffset: number;
  exactText: string;
  codeIds: Code[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Memo {
  _id: string;
  projectId: string;
  content: string;
  documentId?: string;
  quotationId?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ResearchQuestion {
  _id: string;
  projectId: string;
  question: string;
  description?: string;
  codeIds: string[] | Code[];
  memoIds: string[];
  quotationIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  _id: string;
  projectId: string;
  title: string;
  latexContent: string;
  compiledPdf?: string;
  metadata: {
    documentClass: string;
    fontSize: string;
    paperSize: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
