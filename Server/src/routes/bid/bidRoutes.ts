import express from "express";
import { BidService } from "../../services/bid/bidService";
import { BidController } from "../../controller/bidController/bidController";
import bidRepository from "../../repositories/implementaion/bidRepository";
import transporterRepository from "../../repositories/implementaion/transporterRepository";
import truckRepository from "../../repositories/implementaion/truckRepository";
import authenticateToken from "../../Middleware/userAuth";
import { checkRole } from "../../Middleware/checkRole";


const bid_route = express.Router();

const bidService = new BidService(
    transporterRepository,
    bidRepository,
    truckRepository
);
const bidController = new BidController(bidService);


bid_route.post('/bid', authenticateToken, checkRole('transporter'), bidController.createBid.bind(bidController));
bid_route.get('/transporter-bid' ,authenticateToken, checkRole('transporter'), bidController.fetchBidsForTransporter.bind(bidController));
bid_route.put('/bid/:id', authenticateToken, checkRole('transporter'), bidController.updateBid.bind(bidController))
bid_route.delete('/bid/:id', authenticateToken, checkRole('transporter'), bidController.deleteBidById.bind(bidController));
bid_route.get('/shipper-bid', authenticateToken, checkRole('shipper'), bidController.fetchBidsForShipper.bind(bidController));
bid_route.patch('/bid/:id', authenticateToken, checkRole('shipper'), bidController.updateBidStatusByShipper.bind(bidController));



export default bid_route;