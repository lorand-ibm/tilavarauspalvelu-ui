import React from "react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";
import { Button, IconArrowRight, ImageWithCard } from "hds-react";
import { breakpoint } from "../../modules/style";
import Container from "../common/Container";
import { fontMedium, H2 } from "../../modules/style/typography";

const Wrapper = styled(Container)`
  padding-top: var(--spacing-xl);

  @media (max-width: ${breakpoint.m}) {
    display: flex;
    flex-direction: column;
    gap: 46px;
    padding-bottom: var(--spacing-layout-l);
  }
`;

const Heading = styled(H2)`
  margin-top: var(--spacing-s);
`;

const StyledImageWithCard = styled(ImageWithCard)<{ cardAlignment: string }>`
  && {
    --card-color-primary: var(--color-black-90);
    --card-background-primary: var(--color-black-5);
    --card-background-secondary: var(--color-suomenlinna-light);
    max-width: 100%;
    width: unset;
    height: 420px;
    margin-bottom: var(--spacing-2-xl);

    > div:nth-of-type(1) {
      max-width: 600px;
      max-height: 409px;
    }

    > div:nth-of-type(2) {
      > div {
        ${({ cardAlignment }) =>
          cardAlignment === "right" ? `right: 8%;` : `left: 8%;`}
        position: relative;
        min-height: unset;
      }
    }

    @media (max-width: ${breakpoint.m}) {
      display: contents;
      padding-bottom: 200px;

      > div:nth-of-type(1) {
        margin-right: 0;
        margin-left: 0;
        max-width: unset;
        max-height: unset;
      }

      > div:nth-of-type(2) {
        > div {
          position: static;
          margin-right: 0;
          margin-left: 0;
        }
      }
    }

    @media (max-width: ${breakpoint.s}) {
      > div:nth-of-type(1) {
        max-height: 160px;
      }
    }
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-content: space-between;
  word-break: break-word;

  a {
    ${fontMedium}
    text-decoration: underline;
  }

  @media (min-width: ${breakpoint.m}) {
    margin-top: var(--spacing-s);
    margin-bottom: var(--spacing-m);
  }
`;

const ButtonContainer = styled.div`
  margin-top: var(--spacing-xs);

  @media (max-width: ${breakpoint.s}) {
    display: flex;
    flex-direction: column;
  }
`;

const SearchGuides = (): JSX.Element => {
  const { t } = useTranslation("home");
  const router = useRouter();

  return (
    <Wrapper>
      <StyledImageWithCard
        cardAlignment="left"
        cardLayout="hover"
        color="primary"
        src="images/guide-recurring.png"
      >
        <InfoContainer data-test-id="search-guide__recurring">
          <div>
            <Heading>{t("infoRecurring.heading")}</Heading>
            <p>{t("infoRecurring.text")}</p>
          </div>
          <ButtonContainer>
            <Button
              id="browseRecurringReservationUnits"
              onClick={() => router.push("/recurring")}
              iconRight={<IconArrowRight />}
            >
              {t("browseRecurringReservationsButton")}
            </Button>
          </ButtonContainer>
        </InfoContainer>
      </StyledImageWithCard>
      <StyledImageWithCard
        cardAlignment="right"
        cardLayout="hover"
        color="secondary"
        src="images/guide-single.png"
      >
        <InfoContainer data-test-id="search-guide__single">
          <div>
            <Heading>{t("info.heading")}</Heading>
            <p>
              <Trans i18nKey="home:info.text">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://varaamo.hel.fi/"
                >
                  {" "}
                </a>
              </Trans>
            </p>
          </div>
        </InfoContainer>
      </StyledImageWithCard>
    </Wrapper>
  );
};

export default SearchGuides;
