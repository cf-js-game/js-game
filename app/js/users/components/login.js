'use strict';

var React = require('react');
var Fluxxor = require('fluxxor')
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Login = React.createClass({
  mixins: [FluxMixin],
  getInitialState: function() {
    return {user: {username: '', password: '', email: ''}};
  },
  handleChange: function(event) {
    var stateCopy = this.state;
    stateCopy.changed = true;
    if (event.target.name === 'user-email')
      stateCopy.user.email = event.target.value;
    if (event.target.name === 'user-password')
      stateCopy.user.password = event.target.value;

    this.setState(stateCopy);
  },
  handleSubmit: function(event) {
    event.preventDefault();

    console.log(this.state.user);
    this.getFlux().actions.login(this.state.user);
  },
  render: function() {
    var passwordError;
    var emailError;
    var submitButton;
    if (this.state.user.password.length < 1 && this.state.changed)
      passwordError = <span>password cannot be blank</span>;
    if (this.state.user.email.length < 1 && this.state.changed)
      emailError = <span>email cannot be blank</span>;
    if (emailError || passwordError && !this.state.changed)
      submitButton = <button type="submit" disabled>Log In to Exising User</button>;
    else
      submitButton = <button type="submit" >Log In to Exising User</button>;

    return (
      <div>
      <h2>Login</h2>
      <form name="signinform" onSubmit={this.handleSubmit}>
        <label htmlFor="email">Email:</label>
        {emailError}
        <input type="text" name="user-email" id="email" value={this.state.user.email} onChange={this.handleChange} />
        <label htmlFor="password">Password:</label>
        {passwordError}
        <input type="password" name="user-password" id="password" value={this.state.user.password} onChange={this.handleChange} />
        {submitButton}
      </form>
      </div>
    )
  }
});

module.exports = Login;