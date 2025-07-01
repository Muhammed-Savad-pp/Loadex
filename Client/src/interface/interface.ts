export interface userSignUp {
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string
}

export interface formError {
    name?: string,
    email?: string,
    phone?: string,
    password?: string,
    confirmPassword?: string,
}

// types.ts

export interface LoadData {
    _id: string;
    pickupLocation: string;
    dropLocation: string;
    material: string;
    quantity: string;
    length: string;
    truckType: string;
    transportationRent: string;
    height: string;
    breadth: string;
    status: 'active' | 'in-Transit' | 'completed';
    scheduledDate: Date;
    createdAt: Date;
    descriptions: string;
    pickupCoordinates?: {
        latitude: number;
        longitude: number;
    };
    dropCoordinates?: {
        latitude: number;
        longitude: number;
    };
}

export type LoadFormData = Omit<LoadData, '_id' | 'createdAt' | 'status'> & {
  _id?: string;
  status?: 'active' | 'in-Transit' | 'completed';
  createdAt?: Date;
};
