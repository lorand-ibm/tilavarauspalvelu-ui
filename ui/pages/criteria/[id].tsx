import React from "react";
import { useTranslation } from "react-i18next";
import { GetServerSideProps } from "next";
import styled from "styled-components";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Container from "../../components/common/Container";
import apolloClient from "../../modules/apolloClient";
import Sanitize from "../../components/common/Sanitize";
import KorosDefault from "../../components/common/KorosDefault";
import { getTranslation } from "../../modules/util";
import {
  ApplicationRoundType,
  Query,
  QueryApplicationRoundsArgs,
} from "../../modules/gql-types";
import { APPLICATION_ROUNDS } from "../../modules/queries/applicationRound";
import Breadcrumb from "../../components/common/Breadcrumb";

type Props = {
  applicationRound: ApplicationRoundType;
};

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const id = Number(params.id);
  const { data } = await apolloClient.query<Query, QueryApplicationRoundsArgs>({
    query: APPLICATION_ROUNDS,
  });
  const applicationRound = data?.applicationRounds?.edges
    .map((n) => n.node)
    .find((n) => n.pk === id);

  return {
    props: {
      applicationRound,
      ...(await serverSideTranslations(locale)),
    },
  };
};

const Head = styled.div`
  background-color: var(--tilavaraus-hero-background-color);
  color: var(--color-white);
`;

const HeadContent = styled.div`
  padding: var(--spacing-l) var(--spacing-m) var(--spacing-l);
  max-width: var(--container-width-xl);
  margin: 0 auto var(--spacing-2-xl) auto;
  font-size: var(--fontsize-body-xl);
`;

const H1 = styled.h1`
  font-size: var(--fontsize-heading-l);
`;

const Content = styled.div`
  max-width: var(--container-width-l);
  font-family: var(--font-regular);
  font-size: var(--fontsize-body-l);
`;

const Criteria = ({ applicationRound }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <Breadcrumb
          root={{ label: "home", linkTo: "/recurring" }}
          current={{ label: "criteria" }}
        />
        <HeadContent>
          <H1>
            {`${getTranslation(applicationRound, "name")} ${t(
              "applicationRound:criteria"
            )}`}
          </H1>
        </HeadContent>
        <KorosDefault
          from="var(--tilavaraus-hero-background-color)"
          to="var(--color-white)"
        />
      </Head>
      <Container>
        <Content>
          <Sanitize html={getTranslation(applicationRound, "criteria") || ""} />
        </Content>
      </Container>
    </>
  );
};

export default Criteria;
