pragma solidity ^0.8.9;

contract SelfDestructor {

  address payable private immutable owner;
  constructor(address payable _owner) {
    owner = _owner;
  }

  /// @custom:oz-upgrades-unsafe-allow selfdestruct
  function destroyProxy() public {
    require(msg.sender == owner, "No can do");
    selfdestruct(owner);
  }
}
