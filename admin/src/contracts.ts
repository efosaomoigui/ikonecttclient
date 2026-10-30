// Compositions match Agent 1's published controller responses; canonical schemas stay in vendor/.
import { z } from 'zod';
import * as C from '../vendor/contracts';
export const PermissionSnapshot = z.object({roles:z.array(C.Role),permissions:z.array(z.string())});
export const SetupCredentials = z.object({setupToken:z.string().min(32),setupExpiresInMinutes:z.number().int().positive()});
export const CreatedCustomer = SetupCredentials.extend({customer:C.Customer});
export const StaffTicketInput = C.CreateTicketRequest.extend({customerId:C.Id}).strict();
export type ListOptions = z.input<typeof C.CoverageQuery>;
export function parseResponse<S extends z.ZodTypeAny>(schema:S,payload:unknown):z.infer<S>{
    const parsed=schema.safeParse(payload);
    if(!parsed.success)throw new Error('The backend returned a response that does not match API v1.');
    return parsed.data;
}
