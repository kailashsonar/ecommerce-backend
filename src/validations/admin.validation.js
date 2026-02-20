import mongoose from "mongoose";
import z from "zod";

export const getReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    product: z.string().min(2).optional(),
  })
});

export const getProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    name: z.string().optional(),
  })
});

export const getUserSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    username: z.string().optional(),
  })
});

export const idValidationSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid MongoDB ID", })
  })
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    price: z.coerce.number().positive(),
    discount: z.coerce.number().min(0).max(100).default(0),
    stock: z.coerce.number().min(0).default(0),
    category: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), { message: "Invalid MongoDB ID", }),
    sizes: z.preprocess(
      (val) => {
        if (typeof val === "string") return JSON.parse(val);
        return val;
      },
      z.array(z.string()).nonempty()
    ),
    colors: z.preprocess(
      (val) => {
        if (typeof val === "string") return JSON.parse(val);
        return val;
      },
      z.array(
        z.object({
          name: z.string(),
          hexCode: z.string()
        })
      ).nonempty()
    ),
  })
});

export const stockSchema = z.object({
  body: z.object({
    stock: z.coerce.number().min(0),
  })
});

export const discountSchema = z.object({
  body: z.object({
    discount: z.coerce.number().min(0).max(100),
  })
}); 


const updateProduct = z.object({
  name: z.string().min(3).trim(),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100),
  

  sizes: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(z.string()).nonempty()
  ),
  colors: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(
      z.object({
        name: z.string(),
        hexCode: z.string(),
      })
    ).nonempty()
  ),
});

export const updateProductSchema = z.object({
  body: updateProduct
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0, 
      { message: "At least one field must be provided to update" }
    ),
});


export const getOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    city: z.string().optional(),
    state: z.string().optional(),
    orderStatus: z.string().toUpperCase().pipe(z.enum(["CREATED", "PAID", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])).optional()
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.string().toUpperCase().pipe(z.enum(["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]))
  })
});
 
export const getContactsSchema = z.object({
  query: z.object({
    status: z.string().toUpperCase().pipe(z.enum(["NEW", "READ", "REPLIED"])).optional(),
    page: z.coerce.number().int().min(1).default(1),
  })
});

export const updateContactStatusSchema = z.object({
  body: z.object({
    status: z.string().toUpperCase().pipe(z.enum(["READ", "REPLIED"])
    )
  })
});

export const jobApplicationSchema = z.object({
  query: z.object({
    status: z.string().toUpperCase().pipe(z.enum(["NEW", "REVIEWED", "SHORTLISTED", "REJECTED"])).optional()
  })
});

export const updateJobApplicationStatusSchema = z.object({
  body: z.object({
    status: z.string().toUpperCase().pipe(z.enum(["NEW", "REVIEWED", "SHORTLISTED", "REJECTED"]))
  })
});