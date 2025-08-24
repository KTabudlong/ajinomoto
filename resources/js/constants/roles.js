export const ROLES = {
  SUPER_ADMIN: 1,
  TUTOR: 2,
  CUSTOMER: 3,
};

export const isAdmin = (roleId) => roleId === ROLES.SUPER_ADMIN || roleId === ROLES.TUTOR;
export const isSuperAdmin = (roleId) => roleId === ROLES.SUPER_ADMIN;
export const isTutor = (roleId) => roleId === ROLES.TUTOR;
export const isCustomer = (roleId) => roleId === ROLES.CUSTOMER;
