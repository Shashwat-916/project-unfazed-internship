import type { AvailabilityRespository } from "./avalability.Respository";

export class AvailabilityService {
    private avalabilityRepository: AvailabilityRespository;

    constructor(avalabilityRepository: AvailabilityRespository) {
        this.avalabilityRepository = avalabilityRepository;
    }

    async verifyTimeSlot(timeSlotId: number): Promise<boolean> {
        const timeSlots = await this.avalabilityRepository.GetTimeSlots();
        return timeSlots.some(slot => slot.id === timeSlotId);
    }
}