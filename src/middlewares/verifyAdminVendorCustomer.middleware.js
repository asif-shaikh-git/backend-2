export const verifyAdmin = (req, _, next) => {
  if (!req.admin) {
    throw new ApiError(403, "Admin access required");
  }

  next();
};

export const verifyVendor = (req, _, next) => {
  if (!req.vendor) {
    throw new ApiError(403, "Vendor access required");
  }

  next();
};

export const verifyCustomer = (req, _, next) => {
  if (!req.customer) {
    throw new ApiError(403, "Customer access required");
  }

  next();
};