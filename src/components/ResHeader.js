import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

const ResHeader = () => {
  const history = useHistory()

  const signOutButtonClickHandler = () => {
    localStorage.clear()
    history.push('/')
    window.location.reload(false)
  }

  const goToDashboardHandler = () => {
    history.push('/dashboard')
  }

  const goToOrdersHandler = () => {
    history.push('/orders')
  }

  const goToReports = () => {
    history.push('/viewreports');
  };

  const goToPredictHandler = () => {
    history.push('/uploadrecipe');
  }

  return (
    <header style={{ position: 'fixed', top: '0', right: '0', left: '0' }}>
      <Navbar
        bg='dark'
        variant='dark'
        expand='lg'
        className='justify-content-between'
      >
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>
              <p
                style={{ letterSpacing: '4px', fontFamily: 'ui-monospace' }}
                className='my-auto'
              >
                HALIFAX FOODIE
              </p>
            </Navbar.Brand>
          </LinkContainer>
          <Nav>
            <Nav.Link
              className='m-auto'
              onClick={goToOrdersHandler}
              style={{
                fontFamily: 'ui-monospace',
                fontSize: '15px',
              }}
            >
              ORDERS
            </Nav.Link>

            <Nav.Link
              className='m-auto'
              onClick={goToReports}
              style={{
                fontFamily: 'ui-monospace',
                fontSize: '15px',
              }}
            >
              REPORTS
            </Nav.Link>

            <Nav.Link
              className='m-auto'
              onClick={goToPredictHandler}
              style={{
                fontFamily: 'ui-monospace',
                fontSize: '15px',
              }}
            >
            PREDICT
            </Nav.Link>
            
            <Nav.Link
              className='m-auto'
              onClick={goToDashboardHandler}
              style={{
                fontFamily: 'ui-monospace',
                fontSize: '15px',
              }}
            >
            DASHBOARD
            </Nav.Link>
            <Nav.Link
              className='m-auto'
              onClick={signOutButtonClickHandler}
              style={{
                fontFamily: 'ui-monospace',
                fontSize: '15px',
              }}
            >
              SIGN OUT
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </header>
  )
}

export default ResHeader
