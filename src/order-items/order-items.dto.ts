import { InferInsertModel } from 'drizzle-orm';
import { orderItems } from 'src/database';

export type OrderDtoItems = InferInsertModel<typeof orderItems>;
