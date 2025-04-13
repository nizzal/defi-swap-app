// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LPToken.sol";

contract Pool is LPToken, ReentrancyGuard {
    IERC20 immutable i_token0;
    IERC20 immutable i_token1;

    address immutable i_token0_address;
    address immutable i_token1_address;

    uint256 constant INITIAL_RATIO = 2; //token0:token1 = 1:2
    uint256 constant FEE_DENOMINATOR = 1000;
    uint256 constant FEE_NUMERATOR = 3; // 0.3% fee

    mapping(address => uint256) tokenBalances;

    event AddedLiquidity(
        uint256 indexed lpToken,
        address token0,
        uint256 indexed amount0,
        address token1,
        uint256 indexed amount1
    );

    event Swapped(
        address tokenIn,
        uint256 indexed amountIn,
        address tokenOut,
        uint256 indexed amountOut,
        uint256 feeAmount // Add this to include the fee
    );

    event WithdrewLiquidity(
        uint256 indexed lpToken,
        address token0,
        uint256 indexed amount0,
        address token1,
        uint256 indexed amount1
    );

    constructor(address token0, address token1) LPToken("LPToken", "LPT") {
        i_token0 = IERC20(token0);
        i_token1 = IERC20(token1);

        i_token0_address = token0;
        i_token1_address = token1;
    }

    function getAmountOut(
        address tokenIn,
        uint256 amountIn,
        address tokenOut
    ) public view returns (uint256) {
        uint256 balanceOut = tokenBalances[tokenOut];
        uint256 balanceIn = tokenBalances[tokenIn];

        // Calculate fee
        uint256 amountInWithFee = (amountIn *
            (FEE_DENOMINATOR - FEE_NUMERATOR)) / FEE_DENOMINATOR;

        // Calculate amount out using the constant product formula with the adjusted amount
        uint256 amountOut = (balanceOut * amountInWithFee) /
            (balanceIn + amountInWithFee);

        return amountOut;
    }

    function getAmountOutWithoutFee(
        address tokenIn,
        uint256 amountIn,
        address tokenOut
    ) public view returns (uint256) {
        uint256 balanceOut = tokenBalances[tokenOut];
        uint256 balanceIn = tokenBalances[tokenIn];

        // Calculate amount out using the constant product formula WITHOUT fee
        uint256 amountOut = (balanceOut * amountIn) / (balanceIn + amountIn);

        return amountOut;
    }

    function compareOutputs(
        address tokenIn,
        uint256 amountIn,
        address tokenOut
    )
        public
        view
        returns (uint256 withFee, uint256 withoutFee, uint256 feeDifference)
    {
        withFee = getAmountOut(tokenIn, amountIn, tokenOut);
        withoutFee = getAmountOutWithoutFee(tokenIn, amountIn, tokenOut);
        feeDifference = withoutFee - withFee;

        return (withFee, withoutFee, feeDifference);
    }

    function swap(
        address tokenIn,
        uint256 amountIn,
        address tokenOut
    ) public nonReentrant {
        // input validity checks
        require(tokenIn != tokenOut, "Same token");
        require(
            tokenIn == i_token0_address || tokenIn == i_token1_address,
            "Invalid token"
        );
        require(
            tokenOut == i_token0_address || tokenOut == i_token1_address,
            "Invalid token"
        );
        require(amountIn > 0, "Zero amount");

        // Calculate the fee amount
        uint256 feeAmount = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;

        // Calculate the amount user will receive (after fee)
        uint256 amountInWithFee = amountIn - feeAmount;
        uint256 amountOut = getAmountOut(tokenIn, amountInWithFee, tokenOut);

        // swapping tokens
        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "Swap Failed"
        );
        require(
            IERC20(tokenOut).transfer(msg.sender, amountOut),
            "Swap Failed"
        );

        // update pool balances
        tokenBalances[tokenIn] += amountIn;
        tokenBalances[tokenOut] -= amountOut;

        // Emit the event with the fee amount
        emit Swapped(tokenIn, amountIn, tokenOut, amountOut, feeAmount);
    }

    function getReserves() public view returns (uint256, uint256) {
        return (
            tokenBalances[i_token0_address],
            tokenBalances[i_token1_address]
        );
    }

    function getRequiredAmount1(uint256 amount0) public view returns (uint256) {
        uint256 balance0 = tokenBalances[i_token0_address];
        uint256 balance1 = tokenBalances[i_token1_address];

        if (balance0 == 0 || balance1 == 0) {
            return amount0 * INITIAL_RATIO;
        }
        return (amount0 * balance1) / balance0;
    }

    function addLiquidity(uint256 amount0) public nonReentrant {
        // input validity check
        require(amount0 > 0, "Amount must be greater than 0");

        // calculate and mint liquidity tokens
        uint256 amount1 = getRequiredAmount1(amount0);
        uint256 amountLP;
        if (totalSupply() > 0) {
            amountLP =
                (amount0 * totalSupply()) /
                tokenBalances[i_token0_address];
        } else {
            amountLP = amount0;
        }
        _mint(msg.sender, amountLP);

        // deposit token0
        require(
            i_token0.transferFrom(msg.sender, address(this), amount0),
            "Transfer Alpha failed"
        );
        tokenBalances[i_token0_address] += amount0;

        // deposit token1
        require(
            i_token1.transferFrom(msg.sender, address(this), amount1),
            "Transfer Beta failed"
        );
        tokenBalances[i_token1_address] += amount1;

        emit AddedLiquidity(
            amountLP,
            i_token0_address,
            amount0,
            i_token1_address,
            amount1
        );
    }

    // placeholder for wtihdrawLiquidity function
    // function withdrawLiquidity(uint256 amount0) public nonReentrant {
    //     require(amount0 > 0, "Amount must be greater than 1");

    //     uint256 amount1 = getRequiredAmount1(amount0);
    //     uint256 amountLP;

    //     if (totalSupply() > 0) {
    //         amountLP =
    //             (amount0 * totalSupply()) /
    //             tokenBalances[i_token0_address];
    //     } else {
    //         amountLP = amount0;
    //     }

    //     _burn(msg.sender, amountLP);
    // }

    // implement withdrawLiquidity function
    // First, add this event at the top of your contract with the other events

    // Then implement the function
    function withdrawLiquidity(uint256 lpAmount) public nonReentrant {
        // Input validation
        require(lpAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= lpAmount, "Insufficient LP tokens");

        // Calculate the proportion of the pool
        uint256 totalLPSupply = totalSupply();

        // Calculate token amounts based on the proportion
        uint256 amount0 = (lpAmount * tokenBalances[i_token0_address]) /
            totalLPSupply;
        uint256 amount1 = (lpAmount * tokenBalances[i_token1_address]) /
            totalLPSupply;

        // Burn LP tokens first (checks-effects-interactions pattern)
        _burn(msg.sender, lpAmount);

        // Update pool balances
        tokenBalances[i_token0_address] -= amount0;
        tokenBalances[i_token1_address] -= amount1;

        // Transfer tokens to the user
        require(
            i_token0.transfer(msg.sender, amount0),
            "Transfer token0 failed"
        );
        require(
            i_token1.transfer(msg.sender, amount1),
            "Transfer token1 failed"
        );

        // Emit withdrawal event
        emit WithdrewLiquidity(
            lpAmount,
            i_token0_address,
            amount0,
            i_token1_address,
            amount1
        );
    }

    function getToken0Address() external view returns (address) {
        return i_token0_address;
    }

    function getToken1Address() external view returns (address) {
        return i_token1_address;
    }
}
