import { Type } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { CoordinateDto } from "../../coordinate/coordinate.dto";



export class CreateLoadDto {
    @IsNotEmpty({ message: 'Pickup location is required' })
    @IsString()
    pickupLocation!: string;

    @IsNotEmpty({ message: 'Drop location is required' })
    @IsString()
    dropLocation!: string;

    @IsNotEmpty({ message: "Material is required" })
    @IsString()
    material!: string;

    @IsNotEmpty({ message: "Quantity is required" })
    @IsString()
    quantity!: string;

    @IsNotEmpty({ message: "Scheduled date is required" })
    @IsDateString({}, { message: "Scheduled date must be a valid date (YYYY-MM-DD)" })
    scheduledDate!: string;

    @IsOptional()
    @IsString()
    length!: string;

    @IsNotEmpty({ message: "Truck type is required" })
    @IsString()
    truckType!: string;

    @IsNotEmpty({ message: "Transportation rent is required" })
    @IsString()
    transportationRent!: string;

    @IsOptional()
    @IsString()
    height?: string;

    @IsOptional()
    @IsString()
    breadth?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: "Descriptions can be max 500 characters" })
    descriptions?: string;

    @IsNotEmpty({ message: "Pickup coordinates are required" })
    @ValidateNested()
    @Type(() => CoordinateDto)
    pickupCoordinates!: CoordinateDto;

    @IsNotEmpty({ message: "Drop coordinates are required" })
    @ValidateNested()
    @Type(()  => CoordinateDto)
    dropCoordinates!: CoordinateDto;
}