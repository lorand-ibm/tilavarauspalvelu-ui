import { format, parseISO } from "date-fns";
import i18next from "i18next";
import trim from "lodash/trim";
import groupBy from "lodash/groupBy";
import get from "lodash/get";
import {
  AllocationResult,
  ApplicationEventSchedule,
  ApplicationRoundStatus,
  ApplicationStatus,
  GroupedAllocationResult,
  LocalizationLanguages,
  Location,
  NormalizedApplicationRoundStatus,
  RecommendationStatus,
  TranslationObject,
} from "./types";

export const formatDate = (date: string | null): string | null => {
  return date ? format(parseISO(date), "d.M.yyyy") : null;
};

export const formatNumber = (
  input?: number | null,
  suffix?: string
): string => {
  if (!input) return "";

  const number = new Intl.NumberFormat("fi").format(input);

  return `${number}${suffix}`;
};

interface IFormatDurationOutput {
  hours: number;
  minutes: number;
}

export type ApplicationStatusView = "review" | "handling";
export type ApplicationRoundStatusView = "listing";

export const formatDuration = (time: string): IFormatDurationOutput => {
  const [hours, minutes] = time.split(":");
  return {
    hours: Number(hours),
    minutes: Number(minutes),
  };
};

export const getNormalizedApplicationStatus = (
  status: ApplicationStatus,
  view: ApplicationStatusView
): ApplicationStatus => {
  let normalizedStatus: ApplicationStatus = status;
  if (view === "review") {
    if (status === "in_review") {
      normalizedStatus = "review_done";
    }
  }

  return normalizedStatus;
};

export const getNormalizedRecommendationStatus = (
  status: RecommendationStatus
): RecommendationStatus => {
  let normalizedStatus: RecommendationStatus = status;

  if (["created", "allocating", "allocated"].includes(status)) {
    normalizedStatus = "created";
  }

  return normalizedStatus;
};

export const getNormalizedApplicationRoundStatus = (
  status: ApplicationRoundStatus
): ApplicationRoundStatus | NormalizedApplicationRoundStatus => {
  let normalizedStatus: NormalizedApplicationRoundStatus;

  if (["in_review", "review_done", "allocated", "handled"].includes(status)) {
    normalizedStatus = "handling";
  } else {
    normalizedStatus = status;
  }

  return normalizedStatus;
};

export const parseApplicationEventSchedules = (
  applicationEventSchedules: ApplicationEventSchedule[],
  index: number
): string => {
  return (
    applicationEventSchedules
      .filter((s) => s.day === index)
      .reduce((acc: string, cur: ApplicationEventSchedule) => {
        let begin = cur.begin.substring(0, 5);
        const end = cur.end.substring(0, 5);
        let prev = acc;
        let rangeChar = " - ";
        let divider = prev.length ? ", " : "";
        if (acc.endsWith(begin)) {
          begin = "";
          prev = `${prev.slice(0, -5)}`;
          rangeChar = "";
          divider = "";
        }
        return `${prev}${divider}${begin}${rangeChar}${end}`;
      }, "") || "-"
  );
};

interface HMS {
  h?: number;
  m?: number;
  s?: number;
}

export const secondsToHms = (duration?: number): HMS => {
  if (!duration || duration < 0) return {};
  const h = Math.floor(duration / 3600);
  const m = Math.floor((duration % 3600) / 60);
  const s = Math.floor((duration % 3600) % 60);

  return { h, m, s };
};

export const parseDuration = (
  duration: number | undefined,
  unitFormat?: "long"
): string => {
  const hms = secondsToHms(duration);
  let hoursUnit: string;
  let minutesUnit: string;
  let output = "";

  switch (unitFormat) {
    case "long":
      hoursUnit = "common.hoursUnitLong";
      minutesUnit = "common.minutesUnitLong";
      break;
    default:
      hoursUnit = "common.hoursUnit";
      minutesUnit = "common.minutesUnit";
  }
  if (hms.h) output += `${i18next.t(hoursUnit, { count: hms.h })} `;
  if (hms.m) output += `${i18next.t(minutesUnit, { count: hms.m })}`;

  return output.trim();
};

export const formatTimeDistance = (
  timeStart: string,
  timeEnd: string
): number | undefined => {
  const startArr = timeStart.split(":");
  const endArr = timeEnd.split(":");

  if ([...startArr, ...endArr].some((n) => !Number.isInteger(Number(n)))) {
    return undefined;
  }

  const startDate = new Date(
    1,
    1,
    1970,
    Number(startArr[0]),
    Number(startArr[1]),
    Number(startArr[2])
  );
  const endDate = new Date(
    1,
    1,
    1970,
    Number(endArr[0]),
    Number(endArr[1]),
    Number(endArr[2])
  );

  return Math.abs(endDate.getTime() - startDate.getTime()) / 1000;
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
};

export const localizedValue = (
  name: TranslationObject | undefined,
  lang: string
): string => {
  if (!name) {
    return "???";
  }

  return name[lang as LocalizationLanguages] || "???";
};

interface IAgeGroups {
  minimum?: number;
  maximum?: number;
}

export const parseAgeGroups = (ageGroups: IAgeGroups): string => {
  return `${i18next.t("common.agesSuffix", {
    range: trim(`${ageGroups.minimum}-${ageGroups.maximum}`, "-"),
  })}`;
};

export const prepareAllocationResults = (
  results: AllocationResult[]
): GroupedAllocationResult[] => {
  const groups = groupBy(results, (n) => n.allocatedReservationUnitName);
  return Object.keys(groups).map(
    (key: string, index: number): GroupedAllocationResult => {
      const row = groups[key][0] as AllocationResult;
      return {
        id: index + 1,
        space: {
          id: row.allocatedReservationUnitId,
          name: row.allocatedReservationUnitName,
        },
        reservationUnit: {
          name: row.unitName,
        },
        data: get(groups, key),
      };
    }
  );
};

export const parseAddress = (location: Location): string => {
  return trim(
    `${location.addressStreet || ""}, ${location.addressZip || ""} ${
      location.addressCity || ""
    }`,
    ", "
  );
};
