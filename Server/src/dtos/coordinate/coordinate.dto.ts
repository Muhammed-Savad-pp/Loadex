import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class CoordinateDto {
    @IsNotEmpty({ message: 'Latitude is required' })
    @IsNumber({}, { message: 'Latitude must be a number' })
    @Min(-90, { message: 'Latitude cannot be less than -90' })
    @Max(90, { message: 'Latitude cannot be more than 90' })
    latitude!: number

    @IsNotEmpty({ message: "Longitude is required" })
    @IsNumber({}, { message: "Longitude must be a number" })
    @Min(-180, { message: "Longitude cannot be less than -180" })
    @Max(180, { message: "Longitude cannot be more than 180" })
    longitude!: number;
}