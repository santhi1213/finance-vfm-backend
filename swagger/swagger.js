const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vehicle Management API',
      version: '1.0.0',
      description: 'Complete API for Vehicle Management System with Authentication & Role-based Access',
      contact: {
        name: 'API Support',
        email: 'support@vehiclemanagement.com',
        url: 'http://localhost:5000'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
        variables: {
          port: {
            enum: ['5000'],
            default: '5000'
          }
        }
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'Session cookie authentication'
        }
      },
      schemas: {
        // User Registration Schema
        UserRegistration: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
              description: 'Full name of the user'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Email address for login'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123',
              description: 'Password (min 6 characters)'
            },
            role: {
              type: 'string',
              enum: ['admin', 'agent', 'customer'],
              example: 'customer',
              description: 'User role for access control'
            },
            phone: {
              type: 'string',
              example: '+1234567890',
              description: 'Contact number'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                pincode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' }
              }
            }
          }
        },

        // Admin Registration Schema
        AdminRegistration: {
          allOf: [
            { $ref: '#/components/schemas/UserRegistration' },
            {
              type: 'object',
              properties: {
                role: {
                  type: 'string',
                  enum: ['admin'],
                  example: 'admin'
                }
              }
            }
          ]
        },

        // Agent Registration Schema
        AgentRegistration: {
          allOf: [
            { $ref: '#/components/schemas/UserRegistration' },
            {
              type: 'object',
              required: ['employeeId', 'department'],
              properties: {
                role: {
                  type: 'string',
                  enum: ['agent'],
                  example: 'agent'
                },
                employeeId: {
                  type: 'string',
                  example: 'EMP001',
                  description: 'Employee ID for agent'
                },
                department: {
                  type: 'string',
                  enum: ['sales', 'service', 'management'],
                  example: 'sales',
                  description: 'Department of the agent'
                },
                joinDate: {
                  type: 'string',
                  format: 'date',
                  example: '2024-01-01',
                  description: 'Date of joining'
                },
                commission: {
                  type: 'string',
                  example: '5',
                  description: 'Commission percentage'
                },
                supervisorId: {
                  type: 'string',
                  example: '65f2c3e4d5a6b7c8e9f0a1b2',
                  description: 'Supervisor user ID'
                }
              }
            }
          ]
        },

        // Customer Registration Schema
        CustomerRegistration: {
          allOf: [
            { $ref: '#/components/schemas/UserRegistration' },
            {
              type: 'object',
              properties: {
                role: {
                  type: 'string',
                  enum: ['customer'],
                  example: 'customer'
                },
                dateOfBirth: {
                  type: 'string',
                  format: 'date',
                  example: '1990-01-01',
                  description: 'Date of birth'
                },
                occupation: {
                  type: 'string',
                  example: 'Software Engineer',
                  description: 'Customer occupation'
                },
                annualIncome: {
                  type: 'string',
                  example: '750000',
                  description: 'Annual income'
                },
                panCard: {
                  type: 'string',
                  example: 'ABCDE1234F',
                  description: 'PAN card number'
                },
                aadharCard: {
                  type: 'string',
                  example: '123456789012',
                  description: 'Aadhar card number'
                }
              }
            }
          ]
        },

        // Login Schema
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Registered email address'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
              description: 'User password'
            }
          }
        },

        // OTP Verification Schema
        OTPVerification: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Email address'
            },
            otp: {
              type: 'string',
              minLength: 6,
              maxLength: 6,
              example: '123456',
              description: '6-digit OTP received via email'
            }
          }
        },

        // Reset Password Schema
        ResetPassword: {
          type: 'object',
          required: ['email', 'newPassword'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Email address'
            },
            newPassword: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'newpassword123',
              description: 'New password (min 6 characters)'
            }
          }
        },

        // Change Password Schema
        ChangePassword: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              format: 'password',
              example: 'currentpassword123',
              description: 'Current password'
            },
            newPassword: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'newpassword123',
              description: 'New password (min 6 characters)'
            }
          }
        },

        // Forgot Password Schema
        ForgotPassword: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Registered email address'
            }
          }
        },

        // User Response Schema
        UserResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '65f2c3e4d5a6b7c8e9f0a1b2'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              example: 'john.doe@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'agent', 'customer'],
              example: 'customer'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            lastLogin: {
              type: 'string',
              format: 'date-time'
            },
            agentDetails: {
              type: 'object',
              properties: {
                employeeId: { type: 'string' },
                department: { type: 'string' },
                joinDate: { type: 'string', format: 'date' },
                commission: { type: 'string' },
                supervisor: { $ref: '#/components/schemas/UserResponse' }
              }
            },
            customerDetails: {
              type: 'object',
              properties: {
                dateOfBirth: { type: 'string', format: 'date' },
                occupation: { type: 'string' },
                annualIncome: { type: 'string' },
                panCard: { type: 'string' },
                aadharCard: { type: 'string' }
              }
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },

        // API Response Schema
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            },
            error: {
              type: 'string'
            }
          }
        },

        // Error Response Schema
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Not authorized to access this route' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Role is not authorized to access this route' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Validation error message' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints (Login, Register, Logout)'
      },
      {
        name: 'Password Management',
        description: 'Password reset and change endpoints'
      },
      {
        name: 'User Profile',
        description: 'User profile management'
      },
      {
        name: 'Admin Operations',
        description: 'Admin-only operations'
      },
      {
        name: 'Agent Operations',
        description: 'Agent-specific operations'
      },
      {
        name: 'Customer Operations',
        description: 'Customer-specific operations'
      },
      {
        name: 'Vehicles',
        description: 'Vehicle management endpoints'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './swagger/*.js',
    './controllers/*.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;