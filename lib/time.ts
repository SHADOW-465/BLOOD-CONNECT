import { add, format, set, startOfDay } from "date-fns"

type OperatingHours = {
  [day: string]: { open: string; close: string }
}

/**
 * Generates available appointment slots for a given hospital.
 * @param operatingHours The operating hours of the hospital.
 * @param durationMinutes The duration of each appointment slot.
 * @param bookedSlots An array of dates representing already booked appointments.
 * @param daysToGenerate The number of days to generate slots for.
 * @returns An array of available appointment slots as Date objects.
 */
export function generateAvailableSlots(
  operatingHours: OperatingHours,
  durationMinutes: number,
  bookedSlots: Date[],
  daysToGenerate: number = 7,
): Date[] {
  const availableSlots: Date[] = []
  const now = new Date()
  const bookedTimestamps = new Set(bookedSlots.map((d) => d.getTime()))

  for (let i = 0; i < daysToGenerate; i++) {
    const date = add(startOfDay(new Date()), { days: i })
    const dayOfWeek = format(date, "eeee").toLowerCase()
    const hours = operatingHours[dayOfWeek]

    if (hours) {
      const { open, close } = hours
      let currentTime = set(date, {
        hours: parseInt(open.split(":")[0], 10),
        minutes: parseInt(open.split(":")[1], 10),
        seconds: 0,
        milliseconds: 0,
      })

      const closingTime = set(date, {
        hours: parseInt(close.split(":")[0], 10),
        minutes: parseInt(close.split(":")[1], 10),
        seconds: 0,
        milliseconds: 0,
      })

      while (currentTime < closingTime) {
        // Check if the slot is in the future and not already booked
        if (currentTime > now && !bookedTimestamps.has(currentTime.getTime())) {
          availableSlots.push(new Date(currentTime))
        }
        currentTime = add(currentTime, { minutes: durationMinutes })
      }
    }
  }

  return availableSlots
}
