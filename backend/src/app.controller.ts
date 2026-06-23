import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('/api', 301)
  getRoot() {
    // Redirects to Swagger API documentation
  }
}
