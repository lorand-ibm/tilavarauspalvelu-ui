import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import uniq from "lodash/uniq";
import trim from "lodash/trim";
import { Button, Checkbox, IconArrowRight, Notification } from "hds-react";
import {
  AllocationResult,
  ApplicationRound as ApplicationRoundType,
  ApplicationRoundStatus,
  DataFilterConfig,
} from "../../common/types";
import {
  ContentContainer,
  IngressContainer,
  NarrowContainer,
} from "../../styles/layout";
import { breakpoints } from "../../styles/util";
import StatusRecommendation from "../Application/StatusRecommendation";
import withMainMenu from "../withMainMenu";
import ApplicationRoundNavi from "./ApplicationRoundNavi";
import TimeframeStatus from "./TimeframeStatus";
import { ContentHeading, H3 } from "../../styles/typography";
import DataTable, { CellConfig } from "../DataTable";
import Dialog from "../Dialog";
import {
  formatNumber,
  parseDuration,
  prepareAllocationResults,
  processAllocationResult,
} from "../../common/util";
import BigRadio from "../BigRadio";
import LinkPrev from "../LinkPrev";
import Loader from "../Loader";
import {
  getApplicationRound,
  saveApplicationRound,
  getAllocationResults,
} from "../../common/api";

interface IProps {
  applicationRoundId: string;
}

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: var(--spacing-layout-xl);
`;

const TopIngress = styled.div`
  & > div:last-of-type {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: var(--spacing-l);

    ${H3} {
      margin-left: var(--spacing-m);
      width: 50px;
      line-height: var(--lineheight-l);
    }
  }

  display: grid;

  ${ContentHeading} {
    width: 100%;
    padding: 0;
  }

  @media (min-width: ${breakpoints.l}) {
    grid-template-columns: 1.8fr 1fr;
    grid-gap: var(--spacing-layout-m);
  }
`;

const Recommendation = styled.div`
  margin: var(--spacing-m) 0;
`;

const RecommendationLabel = styled.label`
  font-family: var(--tilavaraus-admin-font-bold);
  font-size: 1.375rem;
  font-weight: bold;
`;

const RecommendationValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: var(--spacing-3-xs);
`;

const ActionContainer = styled.div`
  button {
    margin-top: var(--spacing-s);
    width: 100%;
  }

  display: flex;
  justify-content: space-between;
  flex-direction: column-reverse;

  @media (min-width: ${breakpoints.s}) {
    button {
      width: auto;
    }
  }

  @media (min-width: ${breakpoints.l}) {
    & > * {
      &:last-child {
        margin-right: 0;
      }

      margin-right: var(--spacing-m);
    }

    flex-direction: row;

    button {
      height: var(--spacing-3-xl);
    }
  }
`;

const ConfirmationCheckbox = styled(Checkbox)`
  margin: var(--spacing-m) 0;

  label {
    user-select: none;
  }
`;

const IngressFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  margin-bottom: var(--spacing-m);
  padding-top: var(--spacing-l);
  grid-gap: var(--spacing-m);

  .label {
    font-size: var(--fontsize-body-s);
    margin: var(--spacing-3-xs) 0 var(--spacing-2-xs) 0;
    color: var(--color-black-70);
  }

  @media (min-width: ${breakpoints.l}) {
    grid-template-columns: 1fr 1fr;

    & > div:last-of-type {
      text-align: right;
    }
  }
`;

// const SchedulePercentage = styled.span`
//   font-family: var(--tilavaraus-admin-font-bold);
//   font-weight: bold;
//   font-size: 1.375rem;
//   display: block;

//   @media (min-width: ${breakpoints.m}) {
//     display: inline;
//   }
// `;

// const ScheduleCount = styled.span`
//   font-size: var(--fontsize-body-s);
//   display: block;

//   @media (min-width: ${breakpoints.m}) {
//     margin-left: var(--spacing-xs);
//     display: inline;
//   }
// `;

const getCellConfig = (
  t: TFunction,
  applicationRound: ApplicationRoundType | null
): CellConfig => {
  return {
    cols: [
      { title: "Application.headings.applicantName", key: "organisationName" },
      {
        title: "Application.headings.participants",
        key: "organisation.activeMembers",
      },
      {
        title: "Application.headings.applicantType",
        key: "applicantType",
      },
      {
        title: "Recommendation.headings.resolution",
        key: "applicationAggregatedData.reservationsTotal",
        transform: ({
          applicationAggregatedData,
          applicationEvent,
        }: AllocationResult) => (
          <div
            style={{
              display: "flex",
              alignContent: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              {["validated"].includes(applicationEvent.status)
                ? trim(
                    `${formatNumber(
                      applicationAggregatedData?.reservationsTotal,
                      t("common.volumeUnit")
                    )} / ${parseDuration(
                      applicationAggregatedData?.minDurationTotal
                    )}`,
                    " / "
                  )
                : t("Recommendation.noRecommendations")}
            </span>
            <IconArrowRight />
          </div>
        ),
      },
    ],
    index: "applicationEventScheduleId",
    sorting: "organisation.name",
    order: "asc",
    rowLink: ({ applicationEventScheduleId }: AllocationResult) => {
      return applicationEventScheduleId && applicationRound
        ? `/applicationRound/${applicationRound.id}/recommendation/${applicationEventScheduleId}`
        : "";
    },
    groupLink: ({ space }) =>
      applicationRound
        ? `/applicationRound/${applicationRound.id}/space/${space?.id}`
        : "",
  };
};

const getFilterConfig = (
  recommendations: AllocationResult[]
): DataFilterConfig[] => {
  const applicantTypes = uniq(
    recommendations.map((rec) => rec.applicantType)
  ).sort();
  const reservationUnits = uniq(
    recommendations.map((rec) => rec.unitName)
  ).sort();

  return [
    {
      title: "Application.headings.applicantType",
      filters: applicantTypes.map((value) => ({
        title: value,
        key: "applicantType",
        value: value || "",
      })),
    },
    {
      title: "Recommendation.headings.reservationUnit",
      filters: reservationUnits.map((value) => ({
        title: value,
        key: "unitName",
        value: value || "",
      })),
    },
  ];
};

function SupervisorApproval({ applicationRoundId }: IProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmationChecked, toggleIsConfirmationChecked] = useState(false);
  const [
    applicationRound,
    setApplicationRound,
  ] = useState<ApplicationRoundType | null>(null);
  const [isCancelDialogVisible, setCancelDialogVisibility] = useState<boolean>(
    false
  );
  const [
    isConfirmationDialogVisible,
    setConfirmationDialogVisibility,
  ] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<
    AllocationResult[] | []
  >([]);
  const [filterConfig, setFilterConfig] = useState<DataFilterConfig[] | null>(
    null
  );
  const [cellConfig, setCellConfig] = useState<CellConfig | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("handled");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { t } = useTranslation();
  const history = useHistory();

  const setApplicationRoundStatus = async (
    status: ApplicationRoundStatus,
    followupUrl?: string
  ) => {
    const payload = { ...applicationRound, status } as ApplicationRoundType;

    try {
      const result = await saveApplicationRound(payload);
      setApplicationRound(result);
      if (followupUrl) {
        history.push(followupUrl);
      }
    } catch (error) {
      setErrorMsg("errors.errorSavingData");
    }
  };

  useEffect(() => {
    const fetchApplicationRound = async () => {
      setErrorMsg(null);
      setIsLoading(true);

      try {
        const result = await getApplicationRound({
          id: Number(applicationRoundId),
        });
        setApplicationRound(result);
      } catch (error) {
        const msg =
          error.response?.status === 404
            ? "errors.applicationRoundNotFound"
            : "errors.errorFetchingData";
        setErrorMsg(msg);
        setIsLoading(false);
      }
    };

    fetchApplicationRound();
  }, [applicationRoundId, t]);

  useEffect(() => {
    const fetchRecommendations = async (ar: ApplicationRoundType) => {
      try {
        const result = await getAllocationResults({
          applicationRoundId: ar.id,
          serviceSectorId: ar.serviceSectorId,
        });

        setFilterConfig(getFilterConfig(result));
        setCellConfig(getCellConfig(t, ar));
        setRecommendations(processAllocationResult(result) || []);
      } catch (error) {
        setErrorMsg("errors.errorFetchingApplications");
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof applicationRound?.id === "number") {
      fetchRecommendations(applicationRound);
    }
  }, [applicationRound, t]);

  const backLink = "/applicationRounds";

  const filteredResults =
    activeFilter === "orphans"
      ? recommendations.filter(
          (n) => !["validated"].includes(n.applicationEvent.status)
        )
      : recommendations.filter((n) =>
          ["validated"].includes(n.applicationEvent.status)
        );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Wrapper>
      {applicationRound && cellConfig && filterConfig && (
        <>
          <ContentContainer>
            <LinkPrev route={backLink} />
          </ContentContainer>
          <IngressContainer>
            <ApplicationRoundNavi applicationRoundId={applicationRound.id} />
            <TopIngress>
              <div>
                <ContentHeading>{applicationRound.name}</ContentHeading>
                <TimeframeStatus
                  applicationPeriodBegin={
                    applicationRound.applicationPeriodBegin
                  }
                  applicationPeriodEnd={applicationRound.applicationPeriodEnd}
                />
              </div>
              <div />
            </TopIngress>
          </IngressContainer>
          <NarrowContainer style={{ marginBottom: "var(--spacing-xl)" }}>
            <Recommendation>
              <RecommendationLabel>
                {t("Application.recommendedStage")}:
              </RecommendationLabel>
              <RecommendationValue>
                <StatusRecommendation
                  status="supervisorApproval"
                  applicationRound={applicationRound}
                />
              </RecommendationValue>
            </Recommendation>
            <ActionContainer>
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCancelDialogVisibility(true)}
                >
                  {t("ApplicationRound.cancelSupervisorApproval")}
                </Button>
              </div>
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => setConfirmationDialogVisibility(true)}
                  disabled={!isConfirmationChecked}
                >
                  {t("ApplicationRound.approveAndSendToCustomers")}
                </Button>
                <div>
                  <ConfirmationCheckbox
                    id="applicationsChecked"
                    checked={isConfirmationChecked}
                    onClick={() =>
                      toggleIsConfirmationChecked(!isConfirmationChecked)
                    }
                    label={t("Application.iHaveCheckedApplications")}
                  />
                </div>
              </div>
            </ActionContainer>
          </NarrowContainer>
          <IngressContainer>
            <IngressFooter>
              <div>
                {/* <p className="label">
                  {t("ApplicationRound.schedulesToBeGranted")}
                </p>{" "}
                <SchedulePercentage>
                  {t("ApplicationRound.percentageOfCapacity", {
                    percentage: 76,
                  })}
                </SchedulePercentage>
                <ScheduleCount>
                  {`(${formatNumber(
                    scheduledNumbers.volume,
                    t("common.volumeUnit")
                  )} / ${formatNumber(
                    scheduledNumbers.hours,
                    t("common.hoursUnit")
                  )})`}
                </ScheduleCount> */}
              </div>
              <div>
                <BigRadio
                  buttons={[
                    {
                      key: "orphans",
                      text: "ApplicationRound.orphanApplications",
                    },
                    {
                      key: "handled",
                      text: "ApplicationRound.handledApplications",
                    },
                  ]}
                  activeKey={activeFilter}
                  setActiveKey={setActiveFilter}
                />
              </div>
            </IngressFooter>
          </IngressContainer>
          {cellConfig && (
            <DataTable
              groups={prepareAllocationResults(filteredResults)}
              hasGrouping={false}
              config={{
                filtering: true,
                rowFilters: true,
              }}
              cellConfig={cellConfig}
              filterConfig={filterConfig}
            />
          )}
          {isCancelDialogVisible && (
            <Dialog
              closeDialog={() => setCancelDialogVisibility(false)}
              style={
                {
                  "--padding": "var(--spacing-layout-s)",
                } as React.CSSProperties
              }
            >
              <H3>
                {t("ApplicationRound.cancelSupervisorApprovalDialogHeader")}
              </H3>
              <p>{t("ApplicationRound.cancelSupervisorApprovalDialogBody")}</p>
              <ActionContainer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCancelDialogVisibility(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => {
                    setApplicationRoundStatus(
                      "allocated",
                      `/applicationRounds/approvals?cancelled`
                    );
                  }}
                >
                  {t("ApplicationRound.returnListToHandling")}
                </Button>
              </ActionContainer>
            </Dialog>
          )}
          {isConfirmationDialogVisible && (
            <Dialog
              closeDialog={() => setConfirmationDialogVisibility(false)}
              style={
                {
                  "--padding": "var(--spacing-layout-s)",
                } as React.CSSProperties
              }
            >
              <H3>
                {t("ApplicationRound.approveRecommendationsDialogHeader")}
              </H3>
              <p>{t("ApplicationRound.approveRecommendationsDialogBody")}</p>
              <ActionContainer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setConfirmationDialogVisibility(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => {
                    setApplicationRoundStatus(
                      "approved",
                      `/applicationRounds/approvals?approved`
                    );
                  }}
                >
                  {t("common.approve")}
                </Button>
              </ActionContainer>
            </Dialog>
          )}
        </>
      )}
      {errorMsg && (
        <Notification
          type="error"
          label={t("errors.functionFailed")}
          position="top-center"
          autoClose={false}
          dismissible
          closeButtonLabelText={t("common.close")}
          displayAutoCloseProgress={false}
          onClose={() => setErrorMsg(null)}
        >
          {t(errorMsg)}
        </Notification>
      )}
    </Wrapper>
  );
}

export default withMainMenu(SupervisorApproval);
