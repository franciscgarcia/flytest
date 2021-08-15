import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withAuthorization } from '../../session'
import { withFirebase } from '../../firebase'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'
import { Icon } from '@mdi/react'
import { mdiPlus, mdiDelete, mdiPencil } from '@mdi/js'
import { Main } from '../'
import { FlightCard, AddFlight, EditFlight, DeleteFlight } from '.'
import airport from 'airport-codes'
import * as _ from 'lodash';

class Flights extends Component {

  actions = [
    {
      icon: <Icon path={mdiPlus} size={1} />,
      onClick: () => this.setState({ openFlight: true })
    }
  ]  

  updateDelete = [
    {
      icon: <Icon path={mdiPencil} size={1} />,
      onClick: (e, details) => {
        e.stopPropagation();
        this.setState({ editFlight: true, details: details });
      }
    },
    {
      icon: <Icon path={mdiDelete} size={1} />,
      onClick: (e, details) => {
        e.stopPropagation();
        this.setState({ deleteFlight: true, details: details });
      }
    },
  ]

  state = {
    loading: false,
    flights: null,
    openFlight: false,
    editFlight: false,
    deleteFlight: false,
    searchKey : null,
    details: null,
  }

  componentDidMount() {
    this.setState({ loading: true })
    const flightsRef = this.props.firebase.flights()
    flightsRef.orderBy("current", "desc").onSnapshot(snapshot => this.setState({ flights: snapshot.docs, loading: false }))
  }

  render() {
    const { flights, openFlight, editFlight, deleteFlight, details } = this.state
    return (
      <Main actions={this.actions} searchKey={(searchKey) => this.triggerSearch(searchKey)}>
        {this.renderFlightCards(flights)}
        
        <AddFlight open={openFlight} onClose={() => this.setState({ openFlight: false })} />

        { 
          editFlight && <EditFlight details={details} open={editFlight} onClose={() => this.setState({ editFlight: false })} />
        }

        { 
          deleteFlight && <DeleteFlight id={details.id} open={deleteFlight} onClose={() => this.setState({ deleteFlight: false })} />
        }
      </Main>
    )
  }

  renderFlightCards(flights) {
    if (flights) {
      return flights.map((flight) => {
        let details = {
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
        return details
      })
      .filter(flight => {
        let searchKey = this.state.searchKey
        return !searchKey ? true : this.filterFlights(flight, searchKey);
      }) 
      .map((flight) => {
        return <FlightCard actions={this.updateDelete} details={flight} onClick={() => this.addVote(flight)} />
      })
    }
  }
  
  triggerSearch(searchKey){
    this.setState({ searchKey : searchKey, loading : true });
  }

  filterFlights(flight, searchKey) {
    return (flight.origin.toLowerCase().includes(searchKey.toLowerCase()) ||
    flight.destination.toLowerCase().includes(searchKey.toLowerCase()) ||
    flight.orgCountry.toLowerCase().includes(searchKey.toLowerCase()) ||
    flight.orgAirport.toLowerCase().includes(searchKey.toLowerCase()) ||
    flight.destCountry.toLowerCase().includes(searchKey.toLowerCase()) ||
    flight.destAirport.toLowerCase().includes(searchKey.toLowerCase()));
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
    const flightRef = await flightsRef.doc(_.get(flight, 'id'))

    await flightRef.update({
      current : _.get(flight, 'current') + 1,
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