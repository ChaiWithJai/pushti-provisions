export interface DocumentSection {
  title: string;
  preview: string;
}

export interface Document {
  title: string;
  type: string;
  author: string;
  date: string;
  abstract: string;
  downloadUrl: string;
  sections: DocumentSection[];
}

export interface Section {
  title: string;
  content: any;
}

export interface Category {
  title: string;
  subtitle: string;
  sections: Section[];
}

export interface WellnessData {
  [key: string]: Category;
}