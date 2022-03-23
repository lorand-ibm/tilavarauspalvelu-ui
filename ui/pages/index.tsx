import React from "react";
import { useTranslation } from "next-i18next";
import styled from "styled-components";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Header from "../components/index/Header";
import SearchGuides from "../components/index/SearchGuides";
import ServiceInfo from "../components/index/ServiceInfo";
import { breakpoint, StyledKoros } from "../modules/style";
import KorosDefault from "../components/common/KorosDefault";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
};

const Wrapper = styled.div`
  background-color: var(--color-white);
`;

const StyledKorosDefault = styled(KorosDefault)`
  @media (max-width: ${breakpoint.m}) {
    margin-bottom: calc(var(--spacing-xl) * -1);
  }
`;

const Home = (): JSX.Element => {
  const { t } = useTranslation("home");

  return (
    <Wrapper>
      <Header heading={t("head.heading")} text={t("head.text")} />
      <StyledKorosDefault
        from="var(--tilavaraus-hero-background-color)"
        to="var(--color-white)"
      />
      <SearchGuides />
      <StyledKoros
        $from="var(--color-white)"
        $to="var(--color-black-5)"
        type="basic"
      />
      <ServiceInfo />
    </Wrapper>
  );
};

export default Home;
