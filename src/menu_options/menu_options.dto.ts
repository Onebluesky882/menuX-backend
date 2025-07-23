import { InferInsertModel } from 'drizzle-orm';
import { menuOptions } from 'src/database/schema/menuOptions';

export type MenuOption = InferInsertModel<typeof menuOptions>;
