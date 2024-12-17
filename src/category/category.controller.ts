import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { ActiveUserInterface } from '../common/interface/activeUserInterface';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('default')
  async createDefaultCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.createDefaultCategory(createCategoryDto);
  }

  @UseGuards(AuthGuard)
  @Post('user')
  async createCategoryUser(
    @ActiveUser() user: ActiveUserInterface,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.createCategoryUser(createCategoryDto, user);
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async findAll(@ActiveUser() user: ActiveUserInterface) {
    return this.categoryService.findAll(user);
  }
  @Get()
  async findAllDefauld() {
    return this.categoryService.findAllDefauld();
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.categoryService.update(categoryId, updateCategoryDto, user);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') categoryId: string,
    @ActiveUser() user: ActiveUserInterface,
  ) {
    return this.categoryService.remove(categoryId, user);
  }
}
