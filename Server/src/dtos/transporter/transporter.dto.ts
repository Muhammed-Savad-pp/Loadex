import { IShipper } from "../../models/ShipperModel";
import { ITransporter } from "../../models/TransporterModel";
import { ITransporterPayment } from "../../models/TransporterPayment";

interface SubscriptionForTransporterDTO {
    status: string;
    isActive: boolean;
    planId: string;
    planName: string;
    endDate: Date;
    startDate: Date;
}





export interface TransporterForAdminDTO {
    _id: string
    transporterName: string;
    email: string;
    phone: string;
    isBlocked: boolean;
    profileImage: string;
    verificationStatus: string;
    panNumber: string;
    aadhaarFront: string;
    aadhaarBack: string;
}

export class TransporterPaymentDTO {
    public readonly _id: string;
    public readonly transactionId: string;
    public readonly bidId: string;
    public readonly planId: string;
    public readonly transporterId: string;
    public readonly paymentType: string;
    public readonly amount: number;
    public readonly paymentStatus: string;
    public readonly createdAt: Date;
    public readonly transactionType: string;

    constructor (payment: ITransporterPayment) {
        this._id = payment._id as string;
        this.transactionId = payment.transactionId ?? '';
        this.bidId = payment.bidId ? payment.bidId.toString() : '' ;
        this.planId = payment.planId ?? '';
        this.transporterId = payment.transporterId ? payment.transporterId.toString() : '';
        this.paymentType = payment.paymentType;
        this.amount = payment.amount;
        this.paymentStatus = payment.paymentStatus;
        this.createdAt = payment.createdAt;
        this.transactionType = payment.transactionType;
    }

    public static from(payment: ITransporterPayment): TransporterPaymentDTO {
        return new TransporterPaymentDTO(payment)
    }

    public static fromList(payment: ITransporterPayment[]): TransporterPaymentDTO[] {
        return payment.map(data => new TransporterPaymentDTO(data))
    }
}

export class ShipperForTransporterDirectoryDTO {
    public readonly _id: string;
    public readonly shipperName: string;
    public readonly companyName: string;
    public readonly email: string;
    public readonly profileImage: string;

    constructor (shipper: IShipper) {
        this._id = shipper._id as string;
        this.shipperName = shipper.shipperName ?? '';
        this.companyName = shipper.companyName ?? '';
        this.email = shipper.email;
        this.profileImage = shipper.profileImage ?? ''
    }

    public static from(shipper: IShipper): ShipperForTransporterDirectoryDTO {
        return new ShipperForTransporterDirectoryDTO(shipper)
    }

    public static fromLIst(shipper: IShipper[]): ShipperForTransporterDirectoryDTO[] {
        return shipper.map(data => new ShipperForTransporterDirectoryDTO(data))
    }
}

export class ShipperForTransporterDTO {
    public readonly _id: string;
    public readonly shipperName: string;
    public readonly companyName: string;
    public readonly profileImage: string;
    public readonly followers: string[];
    public readonly followings: string[];

    constructor(shipper: IShipper) {
        this._id = shipper._id as string;
        this.shipperName = shipper.shipperName;
        this.companyName = shipper.companyName ?? '';
        this.profileImage = shipper.profileImage ?? '';
        this.followers = shipper.followers ?? [];
        this.followings = shipper.followings ?? [];
    }

    public static from(shipper: IShipper): ShipperForTransporterDTO {
        return new ShipperForTransporterDTO(shipper)
    }
}

export class TransporterDTO {

    public readonly transporterName: string;
    public readonly email: string;
    public readonly phone: string;
    public readonly verificationStatus: string;
    public readonly panNumber: string;
    public readonly aadhaarFront: string;
    public readonly aadhaarBack: string;
    public readonly profileImage: string;
    public readonly followers: string[];
    public readonly followings: string[];
    public readonly subscription: SubscriptionForTransporterDTO;

    constructor(transporter: ITransporter) {
        this.transporterName = transporter.transporterName;
        this.email = transporter.email;
        this.phone = transporter.phone;
        this.verificationStatus = transporter.verificationStatus as string;
        this.panNumber = transporter.panNumber as string;
        this.aadhaarFront = transporter.aadhaarFront as string;
        this.aadhaarBack = transporter.aadhaarBack as string;
        this.profileImage = transporter.profileImage as string;
        this.followers = transporter.followers as [];
        this.followings = transporter.followings as [];
        if (transporter.subscription) {
            this.subscription = {
                status: transporter.subscription.status,
                isActive: transporter.subscription.isActive,
                planId: transporter.subscription.planId,
                planName: transporter.subscription.planName,
                startDate: new Date(transporter.subscription.startDate),
                endDate: new Date(transporter.subscription.endDate),
            };
        } else {
            this.subscription = {
                status: 'pending',
                isActive: false,
                planId: '',
                planName: '',
                startDate: new Date(),
                endDate: new Date(),
            };

        }
    }

    public static from(transporter: ITransporter): TransporterDTO {
        return new TransporterDTO(transporter)
    }
}

