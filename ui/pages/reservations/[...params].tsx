import React, { useEffect } from "react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import styled from "styled-components";
import { useMutation } from "@apollo/client";
import router from "next/router";
import { isFinite } from "lodash";
import { Controller, useForm } from "react-hook-form";
import {
  IconArrowLeft,
  IconCheck,
  IconCrossCircle,
  IconPlusCircle,
  Koros,
  Notification,
  Select,
  TextArea,
} from "hds-react";
import { useTranslation } from "react-i18next";
import {
  Query,
  QueryReservationCancelReasonsArgs,
  ReservationCancellationMutationInput,
  ReservationCancellationMutationPayload,
  ReservationType,
} from "../../modules/gql-types";
import apolloClient from "../../modules/apolloClient";
import {
  CANCEL_RESERVATION,
  GET_RESERVATION,
  GET_RESERVATION_CANCEL_REASONS,
} from "../../modules/queries/reservation";
import {
  fontMedium,
  fontRegular,
  H1,
  H3,
} from "../../modules/style/typography";
import { NarrowCenteredContainer } from "../../modules/style/layout";
import { breakpoint } from "../../modules/style";
import Ticket from "../../components/reservation/Ticket";
import {
  getSelectedOption,
  getTranslation,
  reservationsUrl,
} from "../../modules/util";
import { TwoColumnContainer } from "../../components/common/common";
import { MediumButton } from "../../styles/util";
import { OptionType } from "../../modules/types";
import { emptyOption, reservationUnitSinglePrefix } from "../../modules/const";

type Props = {
  reservation: ReservationType;
  reasons: OptionType[];
};

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query,
}) => {
  const id = Number(query.params[0]);

  if (isFinite(id)) {
    const { data } = await apolloClient.query({
      query: GET_RESERVATION,
      variables: { pk: id },
    });

    if (data && data.reservationByPk.state !== "CANCELLED") {
      const { data: reasonsData } = await apolloClient.query<
        Query,
        QueryReservationCancelReasonsArgs
      >({
        query: GET_RESERVATION_CANCEL_REASONS,
      });

      const reasons = reasonsData.reservationCancelReasons.edges.map(
        (reason) => ({
          label: getTranslation(reason.node, "reason"),
          value: reason.node.pk,
        })
      );

      return {
        props: {
          ...(await serverSideTranslations(locale)),
          reservation: data.reservationByPk,
          reasons,
        },
      };
    }

    return {
      notFound: true,
    };
  }

  return {
    notFound: true,
  };
};

const Head = styled.div`
  padding: var(--spacing-layout-m) 0 0;
  background-color: var(--color-white);
`;

const HeadWrapper = styled(NarrowCenteredContainer)`
  padding: 0 var(--spacing-m);

  @media (min-width: ${breakpoint.m}) {
    max-width: 1000px;
  }
`;

const HeadColumns = styled(TwoColumnContainer)`
  margin-top: 0;
  gap: var(--spacing-m);

  @media (min-width: ${breakpoint.m}) {
    & > div:nth-of-type(1) {
      order: 2;
    }

    gap: var(--spacing-layout-xl);
  }
`;

const Heading = styled.div`
  svg {
    color: var(--color-success);
  }

  h1 {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 32px;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);
  margin-top: var(--spacing-xl);

  @media (min-width: ${breakpoint.s}) {
    flex-direction: row;

    button {
      max-width: 300px;
    }
  }
`;

const StyledKoros = styled(Koros)`
  fill: var(--tilavaraus-gray);

  @media (min-width: ${breakpoint.m}) {
    margin-top: var(--spacing-layout-xl);
  }
`;

const Body = styled.div`
  margin: 0 auto;
  padding: var(--spacing-layout-m) var(--spacing-m);
  max-width: 1000px;
`;

const BodyContainer = styled(NarrowCenteredContainer)`
  background-color: var(--color-gray);
  padding: 0 0 var(--spacing-layout-m) 0;
  ${fontRegular}

  a {
    color: var(--color-bus);
  }

  @media (min-width: ${breakpoint.m}) {
    max-width: 50%;
    padding-right: 50%;
  }
`;

const Form = styled.form`
  label {
    ${fontMedium};
  }
`;

const StyledSelect = styled(Select)`
  margin-bottom: var(--spacing-l);
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-m);

  @media (min-width: ${breakpoint.m}) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const ReservationCancellation = ({
  reservation,
  reasons,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState<"unsent" | "sent">("unsent");

  const reservationUnit = reservation.reservationUnits[0];

  const [cancelReservation, { data, loading, error }] = useMutation<
    { cancelReservation: ReservationCancellationMutationPayload },
    { input: ReservationCancellationMutationInput }
  >(CANCEL_RESERVATION);

  const { register, handleSubmit, getValues, setValue, watch, control } =
    useForm();

  const onSubmit = (formData: {
    reason: { value: number };
    description?: string;
  }) => {
    const { reason, description } = formData;
    cancelReservation({
      variables: {
        input: {
          pk: reservation.pk,
          cancelReasonPk: reason.value,
          cancelDetails: description,
        },
      },
    });
  };

  useEffect(() => {
    if (!loading) {
      if (error || data?.cancelReservation?.errors?.length > 0) {
        setErrorMsg(t("reservations:reservationCancellationFailed"));
      } else if (data) {
        setFormState("sent");
        window.scrollTo(0, 0);
      }
    }
  }, [data, loading, error, t]);

  useEffect(() => {
    register({ name: "reason", required: true });
    register({ name: "description" });
  }, [register]);

  return (
    <>
      <Head>
        <HeadWrapper>
          <HeadColumns>
            <Ticket
              state={formState === "unsent" ? "complete" : "error"}
              title={getTranslation(reservationUnit, "name")}
              subtitle={getTranslation(reservationUnit.unit, "name")}
              begin={reservation.begin}
              end={reservation.end}
              isFree
            />
            <Heading>
              {formState === "unsent" ? (
                <>
                  <H1>{t("reservations:cancelReservation")}</H1>
                  <p>{t("reservations:cancelReservationBody")}</p>
                </>
              ) : (
                <>
                  <H1>
                    <IconCheck size="l" />
                    {t("reservations:reservationCancelledTitle")}
                  </H1>
                  <p>{t("reservations:reservationCancelledBody")}</p>
                </>
              )}
            </Heading>
          </HeadColumns>
        </HeadWrapper>
        <StyledKoros className="koros" type="wave" />
      </Head>
      {formState === "unsent" ? (
        <Body>
          <BodyContainer>
            <H3>{t("reservations:cancelInfo")}</H3>
            <p>{t("reservations:cancelInfoBody")}</p>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                as={
                  <StyledSelect
                    id="reservation__button--cancel-reason"
                    label={`${t("reservations:cancelReason")}`}
                    onChange={(val: OptionType) => {
                      setValue("reason", val.value);
                    }}
                    options={[emptyOption(t("common:select")), ...reasons]}
                    placeholder={t("common:select")}
                    value={getSelectedOption(getValues("reason"), reasons)}
                    required
                  />
                }
                name="reason"
                control={control}
              />
              <TextArea
                id="reservation__button--cancel-description"
                name="description"
                label={t("reservations:cancelDescription")}
                placeholder={t("reservations:cancelDescriptionPlaceholder")}
                onChange={(e) => setValue("description", e.target.value)}
              />
              <Actions>
                <MediumButton
                  variant="secondary"
                  onClick={() => router.push(reservationsUrl)}
                  iconLeft={<IconArrowLeft />}
                  data-testid="reservation-cancel__button--back"
                >
                  {t("common:prev")}
                </MediumButton>
                <MediumButton
                  variant="primary"
                  type="submit"
                  iconLeft={<IconCrossCircle />}
                  disabled={!watch("reason")?.value}
                  data-testid="reservation-cancel__button--cancel"
                >
                  {t("reservations:cancelReservation")}
                </MediumButton>
              </Actions>
            </Form>
          </BodyContainer>
        </Body>
      ) : (
        <Body>
          <ButtonContainer>
            <MediumButton
              variant="primary"
              iconLeft={<IconArrowLeft />}
              onClick={() => router.push("/")}
              data-testid="reservation-cancel__button--back-front"
            >
              {t("common:gotoFrontpage")}
            </MediumButton>
            <MediumButton
              variant="secondary"
              iconLeft={<IconPlusCircle />}
              onClick={() =>
                router.push(
                  `${reservationUnitSinglePrefix}/${reservationUnit.pk}`
                )
              }
              data-testid="reservation-cancel__button--rereserve"
            >
              {t("reservations:makeNewReservation")}
            </MediumButton>
          </ButtonContainer>
        </Body>
      )}
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
    </>
  );
};

export default ReservationCancellation;