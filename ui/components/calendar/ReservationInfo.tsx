import { useRouter } from "next/router";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { differenceInSeconds, isValid, subMinutes } from "date-fns";
import { DateInput, Notification, Select } from "hds-react";
import { useMutation } from "@apollo/client";
import { breakpoint } from "../../modules/style";
import {
  areSlotsReservable,
  doReservationsCollide,
  isReservationLongEnough,
  isStartTimeWithinInterval,
} from "../../modules/calendar";
import { MediumButton } from "../../styles/util";
import {
  ReservationCreateMutationInput,
  ReservationCreateMutationPayload,
  ReservationUnitByPkType,
} from "../../modules/gql-types";
import { DataContext } from "../../context/DataContext";
import { CREATE_RESERVATION } from "../../modules/queries/reservation";
import { fontBold, fontMedium } from "../../modules/style/typography";
import { ApplicationRound, Language, OptionType } from "../../modules/types";
import {
  convertHMSToSeconds,
  secondsToHms,
  toUIDate,
} from "../../modules/util";
import { getDurationOptions } from "../../modules/reservation";
import { getPrice } from "../../modules/reservationUnit";

type Props = {
  reservationUnit: ReservationUnitByPkType;
  begin?: string;
  end?: string;
  resetReservation: () => void;
  isSlotReservable: (start: Date, end: Date) => boolean;
  setCalendarFocusDate: (date: Date) => void;
  activeApplicationRounds: ApplicationRound[];
};

const Wrapper = styled.div`
  display: grid;
  gap: var(--spacing-s);
  align-items: flex-start;
  max-width: 300px;

  button {
    order: unset;
  }

  h3 {
    margin-top: 0;
  }

  label {
    ${fontMedium};
  }

  @media (min-width: ${breakpoint.m}) {
    grid-template-columns: 190px 160px 120px auto;
    gap: var(--spacing-l);
    max-width: unset;

    button {
      max-width: 10rem;
    }
  }

  @media (min-width: ${breakpoint.l}) {
    button {
      max-width: unset;
    }
  }
`;

const InputGroup = styled.div`
  & > * {
    &:nth-of-type(2) {
      margin-left: -2px;
    }

    width: 50%;

    @media (min-width: ${breakpoint.m}) {
      width: 80px;
    }
  }

  label {
    white-space: nowrap;
  }

  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
`;

const PriceWrapper = styled.div`
  ${fontMedium};
  font-size: 21px;
  align-self: center;

  h3 {
    ${fontBold};
    font-size: 24px;
    margin: var(--spacing-3-xs) 0 0 0;
  }
`;

const ReservationInfo = ({
  reservationUnit,
  begin,
  end,
  resetReservation,
  isSlotReservable,
  setCalendarFocusDate,
  activeApplicationRounds,
}: Props): JSX.Element => {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const durationOptions = useMemo(
    () =>
      getDurationOptions(
        reservationUnit.minReservationDuration,
        reservationUnit.maxReservationDuration
      ),
    [
      reservationUnit.minReservationDuration,
      reservationUnit.maxReservationDuration,
    ]
  );

  const { reservation, setReservation } = useContext(DataContext);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [date, setDate] = useState<Date | null>(new Date());
  const [hours, setHours] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string | null>(null);
  const [duration, setDuration] = useState<OptionType | null>(
    durationOptions[0]
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [addReservation, { data, loading, error }] = useMutation<
    { createReservation: ReservationCreateMutationPayload },
    { input: ReservationCreateMutationInput }
  >(CREATE_RESERVATION);

  useEffect(() => {
    if (!loading) {
      if (error || data?.createReservation?.errors?.length > 0) {
        setErrorMsg(t("reservationUnit:reservationFailed"));
      } else if (data) {
        setReservation({
          ...reservation,
          pk: data.createReservation.pk,
          price: data.createReservation.price,
        });
        setIsRedirecting(true);
        router.push(
          `/reservation-unit/single/${reservationUnit.pk}/reservation`
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading, error, t, router, reservationUnit, setReservation]);

  const createReservation = () => {
    setErrorMsg(null);
    const input = {
      begin,
      end,
      reservationUnitPks: [reservationUnit.pk],
    };

    addReservation({
      variables: {
        input,
      },
    });
  };

  useEffect(() => {
    if (begin && end) {
      const newDate = new Date(begin);

      const diff = secondsToHms(
        differenceInSeconds(new Date(end), new Date(begin))
      );
      const durationHMS = `${diff.h || "0"}:${String(diff.m).padEnd(2, "0")}`;
      const newDuration = durationOptions.find((n) => n.value === durationHMS);

      setDate(newDate);
      setHours(String(newDate.getHours()));
      setMinutes(String(newDate.getMinutes()));
      setDuration(newDuration);
    }
  }, [
    begin,
    end,
    setDate,
    setHours,
    setMinutes,
    setDuration,
    durationOptions,
    setReservation,
  ]);

  useEffect(() => {
    if (isValid(date) && hours && (minutes || minutes === "0") && duration) {
      setErrorMsg(null);
      const startDate = new Date(date);
      const endDate = new Date(date);
      const [durationHours, durationMinutes] = String(duration.value).split(
        ":"
      );
      startDate.setHours(Number(hours), Number(minutes));
      endDate.setHours(
        Number(hours) + Number(durationHours),
        Number(minutes) + Number(durationMinutes)
      );

      if (isSlotReservable(startDate, endDate)) {
        setReservation({
          pk: null,
          begin: startDate.toISOString(),
          end: endDate.toISOString(),
          price: null,
        });
      } else {
        setReservation({ pk: null, begin: null, end: null, price: null });
        resetReservation();
      }

      if (
        doReservationsCollide(reservationUnit.reservations, {
          start: startDate,
          end: endDate,
        })
      ) {
        setErrorMsg(t(`reservationCalendar:errors.collision`));
      } else if (
        !areSlotsReservable(
          [startDate, subMinutes(endDate, 1)],
          reservationUnit.openingHours.openingTimes,
          activeApplicationRounds
        )
      ) {
        setErrorMsg(t(`reservationCalendar:errors.unavailable`));
      } else if (
        !isStartTimeWithinInterval(
          startDate,
          reservationUnit.openingHours?.openingTimes,
          reservationUnit.reservationStartInterval
        )
      ) {
        setErrorMsg(t(`reservationCalendar:errors.interval`));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, hours, minutes, duration]);

  useEffect(() => {
    setReservation({ pk: null, begin: null, end: null, price: null });
  }, [setReservation]);

  const hourOptions = Array.from(Array(24).keys()).map((n) => ({
    label: String(n),
    value: String(n),
  }));

  const minuteOptions = [0, 15, 30, 45].map((n) => ({
    label: String(n).padEnd(2, "0"),
    value: String(n),
  }));

  const isReservable =
    begin &&
    end &&
    isReservationLongEnough(
      new Date(begin),
      new Date(end),
      reservationUnit.minReservationDuration
    ) &&
    !loading &&
    !isRedirecting;

  return (
    <Wrapper>
      <DateInput
        onChange={(val, valueAsDate) => {
          if (!val || !isValid(valueAsDate) || valueAsDate < new Date()) {
            resetReservation();
          } else {
            setDate(valueAsDate);
            setCalendarFocusDate(valueAsDate);
          }
        }}
        value={toUIDate(date)}
        helperText={t("reservationCalendar:dateFormatAssist")}
        id="reservation__input--date"
        initialMonth={new Date()}
        label={`${t("reservationCalendar:startDate")} *`}
        language={i18n.language as Language}
      />
      <InputGroup>
        <Select
          id="reservation__input--hours"
          label={`${t("reservationCalendar:startTime")} *`}
          onChange={(val: OptionType) => {
            setHours(val.value as string);
          }}
          options={hourOptions}
          value={hourOptions.find((n) => n.value === hours)}
          helper={t("common:hours")}
        />
        <Select
          id="reservation__input--minutes"
          label=""
          onChange={(val: OptionType) => {
            setMinutes(val.value as string);
          }}
          options={minuteOptions}
          value={minuteOptions.find((n) => String(n.value) === minutes)}
          helper={t("common:minutes")}
        />
      </InputGroup>
      <Select
        id="reservation__input--duration"
        label={`${t("reservationCalendar:duration")} *`}
        onChange={(val: OptionType) => {
          setDuration(val);
        }}
        options={durationOptions}
        value={duration}
        helper={t("reservationCalendar:durationFormatAssist")}
      />
      <PriceWrapper>
        {isReservable && (
          <>
            <div>{t("reservationUnit:price")}:</div>
            <h3 data-testid="reservation__price--value">
              {duration &&
                getPrice(
                  reservationUnit,
                  convertHMSToSeconds(`0${duration.value}:00`) / 60
                )}
            </h3>
          </>
        )}
      </PriceWrapper>
      <MediumButton
        onClick={() => {
          createReservation();
        }}
        disabled={!isReservable}
        data-test="reservation__button--submit"
      >
        {t("reservationCalendar:makeReservation")}
      </MediumButton>
      {errorMsg && (
        <Notification
          type="error"
          label={t("common:error.error")}
          position="top-center"
          autoClose={false}
          displayAutoCloseProgress={false}
          onClose={() => setErrorMsg(null)}
          dismissible
          closeButtonLabelText={t("common:error.closeErrorMsg")}
        >
          {errorMsg}
        </Notification>
      )}
    </Wrapper>
  );
};

export default ReservationInfo;
