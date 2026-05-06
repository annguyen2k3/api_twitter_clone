import { Application } from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger.config'

export const setupSwagger = (app: Application) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: `
        /* Hide topbar */
        .swagger-ui .topbar { display: none }
        
        /* Custom branding */
        .swagger-ui .info .title {
          font-size: 2.5em;
          color: #1DA1F2;
        }
        
        /* Better response styling */
        .swagger-ui table.response-col_description {
          max-width: 300px;
        }
        
        /* Execute button styling */
        .swagger-ui .btn.execute {
          background-color: #1DA1F2;
          border-color: #1DA1F2;
        }
        
        .swagger-ui .btn.execute:hover {
          background-color: #1a91da;
          border-color: #1a91da;
        }
      `,
      customSiteTitle: 'Twitter Clone API Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'options'],
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1
      }
    })
  )

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  console.log('📚 Swagger UI available at http://localhost:3000/api-docs')
}
