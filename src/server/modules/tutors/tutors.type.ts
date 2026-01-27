import { Decimal } from "@prisma/client/runtime/client";


export interface CreateTutorProfileInput {
  title: string;
  headline?: string;
  description?: string;
  hourlyRate: Decimal | number;
  experience?: number;
  education?: string;
  categories?: string[]; // category IDs
}
