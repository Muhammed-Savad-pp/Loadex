import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDateString, IsMobilePhone, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { json } from "stream/consumers";

export class createTruckDto {

    @IsString()
    @IsNotEmpty()
    vehicleNumber!: string;

    @IsString()
    @IsNotEmpty()
    ownerName!: string;

    @IsMobilePhone("en-IN")
    ownerMobileNo!: string;

    @IsString()
    @IsNotEmpty()
    type!: string;

    @IsString()
    capacity!: string;

    @IsString()
    tyres!: string;

    @IsString()
    @IsNotEmpty()
    driverName!: string;

    @IsMobilePhone("en-IN")
    driverMobileNumber!: string;

    @IsString()
    @IsNotEmpty()
    currentLocation!: string;

    @IsString()
    @IsNotEmpty()
    from!: string;


    @IsString()
    @IsNotEmpty()
    to!: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @Transform(({ value }) =>
        typeof value === 'string' ? JSON.parse(value) : value
    )
    selectedLocations!: string[];

    @IsObject()
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === "string" ? JSON.parse(value) : value
    )
    currentLocationCoords?: {
        lat: number;
        lng: number;
    };


    @IsObject()
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === "string" ? JSON.parse(value) : value
    )
    fromCoords?: {
        lat: number;
        lng: number;
    };

    @IsObject()
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === "string" ? JSON.parse(value) : value
    )
    toCoords?: {
        lat: number;
        lng: number;
    };

    @IsDateString()
    rcValidity!: string;

}
