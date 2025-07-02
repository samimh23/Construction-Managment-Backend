import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Construction Management API')
    .setDescription('API documentation for the Construction Management system')
    .setVersion('1.0')
    .addBearerAuth() // If you use JWT auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();