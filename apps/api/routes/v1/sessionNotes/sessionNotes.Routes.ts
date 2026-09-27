import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { SessionNotesController } from "./sessionNotes.Controller";
import { SessionNotesRepository } from "./sessionNotesRepository";

const sessionNotesRouter = Router();

const sessionNotesRepository = new SessionNotesRepository();
const sessionNotesController = new SessionNotesController({ sessionNotesRepository });


sessionNotesRouter.get("/client-shared", authMiddleware, requireRole(["CLIENT"]), sessionNotesController.GetSharedNotesForClient);


const therapistRouter = Router();
therapistRouter.use(authMiddleware, requireRole(["THERAPIST"]));

therapistRouter.post("/", sessionNotesController.CreateNote);
therapistRouter.get("/", sessionNotesController.GetMyNotes);
therapistRouter.get("/:id", sessionNotesController.GetNoteById);
therapistRouter.patch("/:id", sessionNotesController.UpdateNote);
therapistRouter.delete("/:id", sessionNotesController.DeleteNote);

therapistRouter.get("/appointment/:appointmentId", sessionNotesController.GetNotesByAppointment);
therapistRouter.get("/client/:clientId", sessionNotesController.GetNotesByClient);

sessionNotesRouter.use("/", therapistRouter);

export default sessionNotesRouter;
