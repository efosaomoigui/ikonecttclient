import { applyDecorators, ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpCode, HttpException, Injectable, PipeTransform } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Request, Response } from 'express';

export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodTypeAny) {}
  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) throw new BadRequestException({ message: 'Invalid request', details: result.error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) });
    return result.data;
  }
}
const convertSchema: (input: unknown, options: unknown) => any = zodToJsonSchema as any;
export const schema = (value: z.ZodTypeAny): any => convertSchema(value, { target: 'openApi3', $refStrategy: 'none' });
export function Contract(response: z.ZodTypeAny, body?: z.ZodTypeAny, query?: z.ZodObject<any>) {
  const decorators = [HttpCode(200), ApiOkResponse({ schema: schema(response) }), ApiBadRequestResponse({ description: 'Validation failed' })];
  if (body) decorators.push(ApiBody({ schema: schema(body) }));
  if (query) for (const [name, value] of Object.entries(query.shape)) decorators.push(ApiQuery({ name, required: !(value as z.ZodTypeAny).isOptional(), schema: schema(value as z.ZodTypeAny) }));
  return applyDecorators(...decorators);
}
export function wire<T>(value: T): any { return JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? Number(v) : v)); }
export function present<T extends z.ZodTypeAny>(contract: T, value: unknown): z.infer<T> { return contract.parse(wire(value)); }
export async function paginated(model: any, query: { offset: number; limit: number }, where: any = {}, extra: any = {}) {
  const [items, total] = await Promise.all([model.findMany({ where, skip: query.offset, take: query.limit, orderBy: { createdAt: 'desc' }, ...extra }), model.count({ where })]);
  return { items, total, ...query };
}
@Catch()
@Injectable()
export class Errors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request & { requestId: string }>();
    const response = host.switchToHttp().getResponse<Response>();
    let status = 500, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred', details;
    if (error instanceof HttpException) {
      status = error.getStatus(); code = `HTTP_${status}`;
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as any).message;
      details = typeof body === 'object' ? (body as any).details : undefined;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') { status = 409; code = 'DUPLICATE'; message = 'A record with this identifier already exists'; }
      if (['P2025', 'P2003'].includes(error.code)) { status = 404; code = 'NOT_FOUND'; message = 'Related record not found'; }
    } else if (error && typeof error === 'object' && 'type' in error) {
      if (error.type === 'entity.too.large') { status = 413; code = 'PAYLOAD_TOO_LARGE'; message = 'Request body exceeds the allowed size'; }
      if (error.type === 'entity.parse.failed') { status = 400; code = 'INVALID_JSON'; message = 'Request body is not valid JSON'; }
    }
    if (status === 500) console.error(JSON.stringify({ requestId: request.requestId, code, errorType: error instanceof Error ? error.name : 'unknown' }));
    response.status(status).json({ statusCode: status, code, message, requestId: request.requestId, ...(details ? { details } : {}) });
  }
}
