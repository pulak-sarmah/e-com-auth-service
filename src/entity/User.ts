import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tenant } from './Tenant';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column()
    role: string;

    @Column({ type: 'boolean', unique: true, nullable: true })
    isAdmin: boolean | null;

    @ManyToOne(() => Tenant)
    tenant: Tenant;
}
