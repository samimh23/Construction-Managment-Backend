import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';

async function bootstrap() {
  // Print memory usage at boot for diagnostics
  console.log('Memory usage at boot:', process.memoryUsage());

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Construction Management API')
    .setDescription('API documentation for the Construction Management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS BEFORE listening!
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Use dynamic port for cloud deployment, default to 3000
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.register(multipart as any, {
  attachFieldsToBody: true // This helps you access fields from req.body
});

  await app.listen(port, '0.0.0.0'); // '0.0.0.0' is recommended for Fastify/Cloud
  
  console.log(`Server started on port ${port}`);
}

bootstrap();