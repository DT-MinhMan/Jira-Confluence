import { format, isAfter, isBefore, parseISO } from "date-fns";

export type SprintDateBounds = {
  sprintName?: string;
  sprintStartDate?: string;
  sprintEndDate?: string;
};

export function formatSprintDate(dateKey: string): string {
  return format(parseISO(dateKey), "yyyy-MM-dd");
}

export function getSprintBoundaryMessage(bounds: SprintDateBounds): string {
  const name = bounds.sprintName ? ` "${bounds.sprintName}"` : "";
  if (bounds.sprintEndDate) {
    return `Sprint${name} kết thúc vào ngày ${formatSprintDate(bounds.sprintEndDate)}. Không thể dời nhiệm vụ sau thời gian này.`;
  }
  if (bounds.sprintStartDate) {
    return `Sprint${name} bắt đầu vào ngày ${formatSprintDate(bounds.sprintStartDate)}. Không thể dời nhiệm vụ ra ngoài sprint.`;
  }
  return "Không thể dời nhiệm vụ ra ngoài thời gian của sprint.";
}

export function getSprintDateBoundViolation(
  startDate: string,
  endDate: string,
  bounds: SprintDateBounds,
): string | null {
  if (
    bounds.sprintStartDate &&
    isBefore(parseISO(startDate), parseISO(bounds.sprintStartDate))
  ) {
    return `Sprint${bounds.sprintName ? ` "${bounds.sprintName}"` : ""} bắt đầu vào ngày ${formatSprintDate(bounds.sprintStartDate)}. Không thể dời nhiệm vụ trước thời gian này.`;
  }

  if (
    bounds.sprintEndDate &&
    isAfter(parseISO(endDate), parseISO(bounds.sprintEndDate))
  ) {
    return getSprintBoundaryMessage(bounds);
  }

  return null;
}
