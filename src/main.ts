import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Print memory usage at boot for diagnostics
  console.log('Memory usage at boot:', process.memoryUsage());

  const app = await NestFactory.create(AppModule);

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
  await app.listen(port);
  console.log(`Server started on port ${port}`);
}

bootstrap();