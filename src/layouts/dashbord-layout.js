import styled from "styled-components";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FaUsers, FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import { useAuthContext } from "../auth/hooks/use-auth-context";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Container>
      <Sidebar>
        <Logo>ADMIN</Logo>

        <Nav>
          <StyledNavLink to="/dashboard/users">
            <FaUsers />
            <span>Utilisateurs</span>
          </StyledNavLink>
        </Nav>

        <BottomButtons>
          <SidebarButton onClick={() => navigate("/mapcomponent")}>
            <FaArrowLeft />
            <span>Retour Carte</span>
          </SidebarButton>

          <SidebarButton onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Déconnexion</span>
          </SidebarButton>
        </BottomButtons>
      </Sidebar>

      <Main>
        <Header>
          <Title>Tableau de bord - Admin</Title>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Container>
  );
}

// ✅ Styles inchangés + ajouts nécessaires
const Container = styled.div`
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
`;

const Sidebar = styled.aside`
  width: 240px;
  background-color: #2d3748;
  color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 40px;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  color: #fff;
  font-size: 16px;

  &.active {
    background-color: #4a5568;
  }

  &:hover {
    background-color: #4a5568;
  }
`;

const BottomButtons = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SidebarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  width: 100%;
  background-color: #4a5568;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #6b7280;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f7fafc;
`;

const Header = styled.header`
  height: 60px;
  background-color: #edf2f7;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  margin: 0;
`;

const Content = styled.section`
  flex: 1;
  margin-top: 10px;
  padding: 40px;
  overflow-y: auto;
`;
