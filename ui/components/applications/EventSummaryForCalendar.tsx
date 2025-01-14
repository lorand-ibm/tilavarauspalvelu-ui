import {
  Card as HDSCard,
  IconCalendar,
  IconHome,
  IconLocation,
  Select,
} from "hds-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ApiData } from "../../hooks/useApiData";
import {
  displayDate,
  getWeekOption,
  getWeekOptions,
} from "../../modules/calendar";
import { breakpoint } from "../../modules/style";
import { SubHeading } from "../../modules/style/typography";
import {
  ApplicationEvent,
  RecurringReservation,
  Reservation,
  ReservationUnit,
} from "../../modules/types";
import { endOfWeek, getAddress, parseDate } from "../../modules/util";
import { MediumButton } from "../../styles/util";
import { HorisontalRule } from "../common/common";
import ReservationCalendar from "./ReservationCalendar";

const Card = styled(HDSCard)`
  margin-top: var(--spacing-layout-m);

  @media (max-width: ${breakpoint.m}) {
    padding: var(--spacing-s);
  }
`;

const TwoColLayout = styled.div`
  margin-top: var(--spacing-m);
  display: grid;
  grid-gap: var(--spacing-layout-xs);
  grid-template-columns: var(--spacing-layout-m) 1fr;

  @media (max-width: ${breakpoint.m}) {
    grid-template-columns: var(--spacing-layout-xs) 1fr;
  }
`;

const Actions = styled.div`
  display: grid;
  align-items: end;
  grid-gap: var(--spacing-layout-xs);
  grid-template-columns: 1fr 10rem;

  @media (max-width: ${breakpoint.m}) {
    grid-template-columns: 1fr;
  }
`;

const CalendarContainer = styled.div`
  @media (max-width: ${breakpoint.s}) {
    overflow-x: scroll;

    > div {
      width: 30em;
    }
  }
`;

const ReservationUnitName = styled.div`
  font-size: var(--fontsize-heading-m);
  font-family: var(--font-bold);
`;

const BuildingName = styled.div`
  font-size: var(--fontsize-heading-s);
  font-family: var(--font-bold);
`;

const AddressLine = styled.div`
  font-size: var(--fontsize-body-m);
`;

const getWeekEvents = (
  weekBegin: Date,
  weekEnd: Date,
  reservations?: RecurringReservation[]
) =>
  reservations
    ?.flatMap((rr) => rr.reservations)
    .filter((r) => {
      const begin = parseDate(r.begin).getTime();
      const end = parseDate(r.end).getTime();
      return (
        begin > weekBegin.getTime() &&
        begin < weekEnd.getTime() &&
        end > weekBegin.getTime() &&
        end < weekEnd.getTime()
      );
    }) || [];

type Props = {
  applicationEvent: ApplicationEvent;
  reservations: ApiData<RecurringReservation[], unknown>;
};

const ReservationUnitEventsSummaryForCalendar = ({
  applicationEvent,
  reservations,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [week, setWeek] = useState(getWeekOption(new Date(), t));

  const startDate = new Date(week.value as number);
  const endDate = endOfWeek(startDate);

  const weekEvents = getWeekEvents(startDate, endDate, reservations.data);

  const keys = [] as ReservationUnit[];
  const resUnitEvents = weekEvents.reduce((prev, reservation) => {
    reservation.reservationUnit.forEach((resUnit) => {
      let key = keys.find((k) => k.id === resUnit.id);
      if (!key) {
        keys.push(resUnit);
        key = resUnit;
      }

      const resUnitArray = prev.get(key);
      if (resUnitArray) {
        resUnitArray.push(reservation);
      } else {
        prev.set(key, [reservation]);
      }
    });

    return prev;
  }, new Map<ReservationUnit, Reservation[]>());

  return (
    <>
      <SubHeading>{applicationEvent.name}</SubHeading>
      <Card border>
        {applicationEvent.eventReservationUnits.map((resUnit) => (
          <div key={resUnit.reservationUnitId}>
            <Actions>
              <Select
                label={t("reservations:weekSelectLabel")}
                multiselect={false}
                icon={<IconCalendar />}
                options={getWeekOptions(t, applicationEvent)}
                value={week}
                onChange={(w) => {
                  setWeek(w);
                }}
              />
              <MediumButton
                id="setCurrentWeek"
                variant="secondary"
                onClick={() => {
                  setWeek(getWeekOption(new Date(), t));
                }}
              >
                {t("common:today")}
              </MediumButton>
            </Actions>

            <TwoColLayout>
              <IconCalendar />
              <div>
                {displayDate(startDate, t)} - {displayDate(endDate, t)}
              </div>
              {weekEvents.map((reservation) => {
                const begin = parseDate(reservation.begin);
                const end = parseDate(reservation.end);
                return (
                  <>
                    <div>{t(`common:weekDay.${begin.getDay()}`)}</div>
                    <div>
                      {" "}
                      {t("common:time", {
                        date: begin,
                      })}{" "}
                      - {t("common:time", { date: end })}
                    </div>
                  </>
                );
              })}
            </TwoColLayout>
            {Array.from(resUnitEvents.entries()).map(
              ([reservationUnit, resUnitReservations]) => {
                return (
                  <>
                    <TwoColLayout>
                      <IconHome />
                      <ReservationUnitName>
                        {reservationUnit.name.fi}
                      </ReservationUnitName>
                      <IconLocation />
                      <div>
                        <BuildingName>
                          {reservationUnit.building?.name}
                        </BuildingName>
                        <AddressLine>{getAddress(reservationUnit)}</AddressLine>
                      </div>
                    </TwoColLayout>
                    <HorisontalRule />
                    <CalendarContainer>
                      <div>
                        <ReservationCalendar
                          begin={new Date(week.value as number)}
                          reservations={resUnitReservations}
                          reservationUnit={reservationUnit}
                          applicationEvent={applicationEvent}
                        />
                      </div>
                    </CalendarContainer>
                  </>
                );
              }
            )}
          </div>
        ))}
      </Card>
    </>
  );
};

export default ReservationUnitEventsSummaryForCalendar;
