package luckcoin_utils

import (
	"fmt"
	"github.com/stretchr/testify/assert"
    "github.com/shopspring/decimal"
	"testing"
)

func TestGenerateBuckets(t *testing.T) {
	retEq := GenerateBuckets(MethodEqual, 10, 400, 4)
	retFair := GenerateBuckets(MethodFair, 10, 400, 4)
	retRand := GenerateBuckets(MethodRand, 10, 400, 4)
	sumEq := decimal.Sum(retEq[0], retEq[1:]...)
	sumFair := decimal.Sum(retFair[0], retFair[1:]...)
	sumRand := decimal.Sum(retRand[0], retRand[1:]...)
	assert.Equal(t, sumEq.String(), decimal.NewFromFloat(10.00).String())
	assert.Equal(t, sumFair.String(), decimal.NewFromFloat(10.00).String())
	assert.Equal(t, sumRand.String(), decimal.NewFromFloat(10.00).String())
	// fmt.Printf("Equa: %v, Sum = %v\n", retEq, sumEq)
	fmt.Printf("Fair: %v, Sum = %v\n", retFair, sumFair)
	fmt.Printf("Rand: %v, Sum = %v\n", retRand, sumRand)
}
