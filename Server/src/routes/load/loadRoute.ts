import express from "express"
import { LoadService } from "../../services/load/loadService";
import { LoadController } from "../../controller/loadController/loadController";
import authenticateToken from "../../Middleware/userAuth";
import { checkRole } from "../../Middleware/checkRole";
import shipperRepositories from "../../repositories/implementaion/shipperRepositories";
import loadRepository from "../../repositories/implementaion/loadRepository";
import { validateDto } from "../../Middleware/validate-dto";
import { CreateLoadDto } from "../../dtos/load/request/load.dto";

const load_route = express.Router();

const loadService = new LoadService(
    shipperRepositories,
    loadRepository
);

const loadController = new LoadController(loadService);

load_route.post('/load',authenticateToken, checkRole('shipper'), validateDto(CreateLoadDto), loadController.postLoad.bind(loadController));
load_route.get('/', authenticateToken, checkRole('shipper'), loadController.fetchLoads.bind(loadController));
load_route.put('/load', authenticateToken, checkRole('shipper'),validateDto(CreateLoadDto), loadController.updateLoad.bind(loadController));
load_route.delete('/load/:id', authenticateToken, checkRole('shipper'), loadController.deleteLoad.bind(loadController));
load_route.get('/admin/loads', authenticateToken, checkRole('admin'), loadController.loadsForAdmin.bind(loadController));
load_route.get('/transporter-loads', authenticateToken, checkRole('transporter'), loadController.loadsForTransporter.bind(loadController));




export default load_route;