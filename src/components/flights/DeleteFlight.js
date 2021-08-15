import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withFirebase } from '../../firebase'
import { Dialog, DialogTitle, Divider, DialogActions, Button } from '@material-ui/core'

const styles = {
  warningMessage: {
    height: '10vh',
    minHeight: '85px',
    width: '85%',
    padding: '0 7%',

  }
}

/**
* @augments {Component<{  item:object>}
*/
class DeleteFlight extends Component {
    state = {
      loading : false,
      success : false
    }
    render(){
        const { id, open } = this.props
        
        return (
            <Dialog
              disableBackdropClick
              disableEscapeKeyDown
              maxWidth={false}
              onClose={this.handleClose.bind(this)}
              aria-labelledby="confirmation-dialog-title"
              open={open}
            >
              <DialogTitle id="confirmation-dialog-title">Delete Flight</DialogTitle>
              
              <div style={styles.warningMessage}>
                
                Warning! This Action cannot be undone. Proceed?
              
              </div>
              
              <DialogActions>
                <Button onClick={ this.handleClose.bind(this) }>
                  Cancel
                </Button>

                <Button onClick={() => this.deleteFlight(id)} color="secondary">
                  Yes
                </Button>
              </DialogActions>
            </Dialog>
          );
    }

    handleClose(){
      this.props.onClose();
    }

    async deleteFlight(id){
      if (!this.state.success) {
        this.setState({ loading: true })
        const flightsRef = this.props.firebase.flights()
        const flightRef = await flightsRef.doc(id)

        await flightRef.delete()

        this.setState({ loading: false, success: true })
        this.handleClose();
      }
    }
}

const mapStateToProps = (state) => ({
    userId: state.auth.user.uid
  })
  
export default connect(
    mapStateToProps
)(withFirebase(DeleteFlight))