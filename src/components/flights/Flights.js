import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withAuthorization } from '../../session'
import { withFirebase } from '../../firebase'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'
import { Icon } from '@mdi/react'
import { mdiPlus } from '@mdi/js'
import { Main } from '../'
import { FlightCard, AddFlight } from '.'
import airport from 'airport-codes'

class Flights extends Component {

  actions = [
    {
      icon: <Icon path={mdiPlus} size={1} />,
      onClick: () => this.setState({ openFlight: true })
    }
  ]

  state = {
    loading: false,
    flights: null,
    openFlight: false,
    searchKey : null,
  }

  componentDidMount() {
    this.setState({ loading: true })
    const flightsRef = this.props.firebase.flights()
    flightsRef.onSnapshot(snapshot => this.setState({ flights: snapshot.docs, loading: false }))
  }

  render() {
    const { flights, openFlight } = this.state
    return (
      <Main actions={this.actions} setSearch={(searchKey) => this.searchFlight(searchKey)}>
        {this.renderFlightCards(flights)}
        <AddFlight open={openFlight} onClose={() => this.setState({ openFlight: false })} />
      </Main>
    )
  }

  renderFlightCards(flights) {
    if (flights) {
      return flights.map((flight) => {
        let flightData = {
          id : flight.id,
          current : flight.data().current,
          origin : flight.data().origin,
          destination : flight.data().destination,
          date: flight.data().date,
          orgCountry : this.getCountry(flight.data().origin),
          orgAirport : this.getAirport(flight.data().origin),
          destCountry : this.getCountry(flight.data().destination),
          destAirport : this.getAirport(flight.data().destination)
        }
        return flightData
      })
      .filter(flight => {
        let searchKey = this.state.searchKey
        return !searchKey ? true : 
              (flight.origin.toLowerCase().includes(searchKey.toLowerCase()) ||
              flight.destination.toLowerCase().includes(searchKey.toLowerCase()) ||
              flight.orgCountry.toLowerCase().includes(searchKey.toLowerCase()) ||
              flight.orgAirport.toLowerCase().includes(searchKey.toLowerCase()) ||
              flight.destCountry.toLowerCase().includes(searchKey.toLowerCase()) ||
              flight.destAirport.toLowerCase().includes(searchKey.toLowerCase()));
      })      
      .sort((a,b) => {
        return b.current - a.current
      })
      .map((flight) => {
        return <FlightCard details={flight} onClick={() => this.addVote(flight)} />
      })
    }
  }
  
  searchFlight(searchKey){
    this.setState({ searchKey : searchKey, loading : true });
  }
  
  getCountry(iata) {
    return airport.findWhere({ iata: iata }).get('country')
  }

  getAirport(iata){
    return airport.findWhere({ iata: iata }).get('name')
  }

  async addVote(flight){
    this.setState({ loading: true })
    const flightsRef = this.props.firebase.flights()
    const flightRef = await flightsRef.doc(flight.id)

    await flightRef.update({
      // current : 40,
      current : flight.current + 1,
    })

    this.setState({ loading: false })
  }
}

const condition = authUser => !!authUser;

export default connect()(
  compose(
    withRouter,
    withFirebase,
    withAuthorization(condition),
  )(Flights))