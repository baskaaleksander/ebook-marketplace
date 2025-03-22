import { IsNumber, Min } from 'class-validator';

export class AmountDto {

    @IsNumber()
    @Min(1)
    amount: number;
}