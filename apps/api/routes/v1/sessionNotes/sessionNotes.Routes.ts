import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middleware/authMiddlware";
import { SessionNotesController } from "./sessionNotes.Controller";
import { SessionNotesRepository } from "./sessionNotesRepository";

const sessionNotesRouter = Router();

const sessionNotesRepository = new SessionNotesRepository();
const sessionNotesController = new SessionNotesController({ sessionNotesRepository });

// All session notes endpoints require authentication and THERAPIST role
sessionNotesRouter.use(authMiddleware, requireRole(["THERAPIST"]));

sessionNotesRouter.post("/", sessionNotesController.CreateNote);
sessionNotesRouter.get("/", sessionNotesController.GetMyNotes);
sessionNotesRouter.get("/:id", sessionNotesController.GetNoteById);
sessionNotesRouter.patch("/:id", sessionNotesController.UpdateNote);
sessionNotesRouter.delete("/:id", sessionNotesController.DeleteNote);

sessionNotesRouter.get("/appointment/:appointmentId", sessionNotesController.GetNotesByAppointment);
sessionNotesRouter.get("/client/:clientId", sessionNotesController.GetNotesByClient);

export default sessionNotesRouter;
