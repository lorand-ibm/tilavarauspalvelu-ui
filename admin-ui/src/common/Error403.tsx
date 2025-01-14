import { useReactOidc } from "@axa-fr/react-oidc-context";
import { Button, Link } from "hds-react";
import React from "react";
import styled from "styled-components";
import { H1 } from "../styles/new-typography";
import { breakpoints } from "../styles/util";
import { localLogout } from "./auth/util";

const Wrapper = styled.div`
  margin: 0 var(--spacing-s);
  word-break: break-word;
  gap: var(--spacing-layout-m);
  display: flex;
  flex-direction: column;
  h1 {
    margin-bottom: 0;
    font-size: 2.5em;
  }

  @media (min-width: ${breakpoints.l}) {
    margin: var(--spacing-layout-2-xl);
    grid-template-columns: 3fr 1fr;
    display: grid;
    h1 {
      font-size: 4em;
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  gap: 1.5rem;
`;

const Image = styled.img`
  width: 100%;
  max-width: 400px;
  @media (min-width: ${breakpoints.l}) {
    width: auto;
  }
`;

const ButtonContainer = styled.div`
  margin-top: var(--spacing-s);
`;

const Error403 = (): JSX.Element => {
  const { oidcUser, logout } = useReactOidc();

  return (
    <Wrapper>
      <Content>
        <H1>
          403 - Sinulla ei ole käyt&shy;tö&shy;oi&shy;keuk&shy;sia tälle sivulle
        </H1>
        <p>
          Sivu on nähtävillä vain kirjautuneille käyttäjille. Voit nähdä sivun
          sisällön jos kirjaudut sisään ja sinulla on riittävän laajat
          käyttöoikeudet.
        </p>
        <Link external href="/">
          Siirry Varaamon etusivulle
        </Link>
        <Link
          external
          href="https://app.helmet-kirjasto.fi/forms/?site=varaamopalaute&ref=https://tilavaraus.hel.fi/"
        >
          Anna palautetta
        </Link>
        {oidcUser && (
          <ButtonContainer>
            <Button
              onClick={() => {
                localLogout();
                logout();
              }}
            >
              Kirjaudu ulos
            </Button>
          </ButtonContainer>
        )}
      </Content>
      <Image src="/403.png" />
    </Wrapper>
  );
};

export default Error403;
