import React from "react";
import { Container, IconArrowRight } from "hds-react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Link from "next/link";
import styled from "styled-components";
import { parseISO } from "date-fns";
import Card from "../common/Card";
import { ApplicationRound } from "../../modules/types";
import { applicationRoundState, searchUrl } from "../../modules/util";
import { breakpoint } from "../../modules/style";
import { MediumButton } from "../../styles/util";
import { fontMedium } from "../../modules/style/typography";

interface Props {
  applicationRound: ApplicationRound;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledCard = styled(({ act, ...rest }) => <Card {...rest} />)`
  && {
    max-width: var(--container-width-m);
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-gap: var(--spacing-m);
    align-items: start;
    padding: var(--spacing-m);
    margin-bottom: var(--spacing-s);
    border-color: ${(props) => props.act && "var(--tilavaraus-green)"};
    background-color: ${(props) => props.act && "var(--tilavaraus-cyan)"};

    @media (max-width: ${breakpoint.s}) {
      grid-template-columns: 1fr;
    }
  }
`;

const StyledContainer = styled(Container)`
  line-height: var(--lineheight-xl);
  max-width: 100%;
`;

const Name = styled.div`
  font-size: var(--fontsize-body-xl);
  font-weight: 500;
`;

const CardButton = styled(MediumButton)`
  justify-self: right;
  width: 100%;

  @media (min-width: ${breakpoint.s}) {
    width: max-content;
  }
`;

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--spacing-2-xs);
  margin-top: var(--spacing-s);
  ${fontMedium};

  && {
    color: var(--color-bus);
  }
`;

const ApplicationRoundCard = ({ applicationRound }: Props): JSX.Element => {
  const { t } = useTranslation();

  const history = useRouter();

  const state = applicationRoundState(
    applicationRound.applicationPeriodBegin,
    applicationRound.applicationPeriodEnd
  );

  return (
    <StyledCard
      aria-label={applicationRound.name}
      border
      act={state === "active" ? true : undefined}
    >
      <StyledContainer>
        <Name>{applicationRound.name}</Name>
        <div>
          {state === "pending" &&
            t("applicationRound:card.pending", {
              openingDateTime: t("common:dateTime", {
                date: parseISO(applicationRound.applicationPeriodBegin),
              }),
            })}
          {state === "active" &&
            t("applicationRound:card.open", {
              until: parseISO(applicationRound.applicationPeriodEnd),
            })}
          {state === "past" &&
            t("applicationRound:card.past", {
              closingDate: parseISO(applicationRound.applicationPeriodEnd),
            })}
        </div>
        <Link href={`/criteria/${applicationRound.id}`} passHref>
          <StyledLink>
            <IconArrowRight />
            {t("applicationRound:card.criteria")}
          </StyledLink>
        </Link>
      </StyledContainer>
      {state === "active" && (
        <CardButton
          onClick={() =>
            history.push(searchUrl({ applicationRound: applicationRound.id }))
          }
        >
          {t("application:Intro.startNewApplication")}
        </CardButton>
      )}
    </StyledCard>
  );
};

export default ApplicationRoundCard;
