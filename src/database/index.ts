import { customers } from './schema/customers';
import { orders } from './schema/orders';
import { shops } from './schema/shops';
import { shopTables } from './schema/shopTables';
import { users } from './schema/users';
import { orderTable } from './schema/orderTable';
import { images } from './schema/images';
import { roles } from './schema/roles';
import { employees } from './schema/employees';
import { categories } from './schema/categories';
import { pages } from './schema/pages';
import { tableGridLayout } from './schema/tableGridsLayout';
import { menus } from './schema/menus';
import { employers } from './schema/employers';
import { orderItems } from './schema/orderItems';
import { lineUser } from './schema/lineUser';
import { menuOptions } from './schema/menuOptions';
import { slipVerifications } from './schema/slipVerifications';

export * from './schema/orders';
export * from './schema/shops';
export * from './schema/users';
export * from './schema/customers';
export * from './schema/shopTables';
export * from './schema/orderTable';
export * from './schema/images';
export * from './schema/roles';
export * from './schema/employees';
export * from './schema/pages';
export * from './schema/categories';
export * from './schema/tableGridsLayout';
export * from './schema/menus';
export * from './schema/employers';
export * from './schema/orderItems';
export * from './schema/lineUser';
export * from './schema/menuOptions';
export * from './schema/slipVerifications';

export * from './relations/orders.relation';
export * from './relations/image.relation';
export * from './relations/owner.relation';
export * from './relations/menu.relation';
export * from './relations/menuOptions.relation';
export * from './relations/menuPhotos.relation';

export const schema = {
  users,
  orders,
  shops,
  customers,
  shopTables,
  orderTable,
  employees,
  images,
  roles,
  pages,
  categories,
  tableGridLayout,
  menus,
  employers,
  orderItems,
  lineUser,
  menuOptions,
  slipVerifications,
};
