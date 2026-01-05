export enum ClaimStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
}

export interface InvoiceDetails {
  customerName: string;
  invoiceNumber: string;
  purchaseDate: string;
  file: File | null;
}

export interface Issue {
  id: string;
  imageUrls: string[];
  detectedIssue: string; // From AI
  remarks: string;
  timestamp: number;
}

export interface FollowUp {
  id: string;
  message: string;
  date: string;
  status: 'Pending' | 'Responded';
  response?: string;
}

export interface ClaimDetailsData {
  invoice: {
    customerName: string;
    invoiceNumber: string;
    purchaseDate: string;
  };
  issues: Issue[];
  followUps?: FollowUp[];
}

export interface Claim {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  date: string;
  thumbnailUrl: string;
  details?: ClaimDetailsData;
}

export interface DraftClaim {
  invoice: InvoiceDetails;
  issues: Issue[];
}

export enum AppScreen {
  DASHBOARD = 'DASHBOARD',
  WIZARD_INVOICE = 'WIZARD_INVOICE',
  WIZARD_ISSUES = 'WIZARD_ISSUES',
  WIZARD_REVIEW = 'WIZARD_REVIEW',
  SUCCESS = 'SUCCESS',
  CLAIM_DETAILS = 'CLAIM_DETAILS',
}

export enum IssueStepView {
  LIST = 'LIST',
  CAPTURE = 'CAPTURE',
  ANALYZING = 'ANALYZING',
}
