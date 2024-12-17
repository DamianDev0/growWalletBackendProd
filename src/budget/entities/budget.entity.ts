import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';
import { Period } from 'src/common/enum/period.enum';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  amount: number;

  @Column('float', { default: 0 })
  spentAmount: number;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column({ type: 'enum', enum: Period, default: Period.MONTHLY })
  period: Period;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.budgets)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.budgets)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
