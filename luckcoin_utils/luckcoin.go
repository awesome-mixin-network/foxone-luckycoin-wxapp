package luckcoin_utils

import (
	"math"
	"math/rand"
	"time"
	"github.com/shopspring/decimal"
	"github.com/thoas/go-funk"
)

const (
	MethodEqual int = iota
	MethodFair
	MethodRand
)

func getPrecision(unit int) float64 {
	return 1 / math.Pow(10, float64(unit))
}

func toFixed(num float64, precision float64) float64 {
	return float64(math.Round(num/precision)) * precision
}

func distributeRand(amount float64, num int, unit int) []decimal.Decimal {
	buckets := make([]decimal.Decimal, num)
	exp := 0 - int32(unit)
	zero := decimal.NewFromFloat(0.00)
	precisionDec := decimal.NewFromFloatWithExponent(getPrecision(unit), exp)
	amountDec := decimal.NewFromFloatWithExponent(amount, exp)
	// 给每一个 bucket 都加入一个最小值，确保每个人至少能领到这个最小值
	buckets = funk.Map(buckets, func(x decimal.Decimal) decimal.Decimal {
		return precisionDec
	}).([]decimal.Decimal)
	amountDec = amountDec.Sub(decimal.Sum(buckets[0], buckets[1:]...))
	// 开始分配
	for i := 0; i < num - 1 && amountDec.Cmp(zero) > 0; i++ {
		// pick a random from range [最小值, 剩下的]
		rndDec := decimal.NewFromFloatWithExponent(rand.Float64(), exp)
		inc := rndDec.Mul(amountDec).Round(int32(unit))
		// 确保还有足够的 amount
		if amountDec.Sub(inc).Cmp(zero) <= 0 {
			inc = amountDec
		}
		buckets[i] = buckets[i].Add(inc)
		amountDec = amountDec.Sub(inc)
	}
	// 如果还剩下点，就给最后一个 buckets
	if amountDec.Cmp(zero) > 0 {
		buckets[num-1] = amountDec
	}
	// 洗牌
	shuffled := funk.Shuffle(buckets).([]decimal.Decimal)
	return shuffled
}

func distributeEq(amount float64, num int, unit int) []decimal.Decimal {
	buckets := make([]decimal.Decimal, num)
	amountDec := decimal.NewFromFloat(amount)
	numDec := decimal.NewFromFloat(float64(num))
	partDec := amountDec.DivRound(numDec, int32(unit))
	for i := 0; i < num-1; i++ {
		buckets[i] = partDec
		amountDec = amountDec.Sub(buckets[i])
	}
	buckets[num-1] = amountDec
	return buckets
}

func distributeFair(amount float64, num int, unit int) []decimal.Decimal {
	buckets := make([]decimal.Decimal, num)
	amountDec := decimal.NewFromFloat(amount)

	exp := 0 - int32(unit)
	zero := decimal.NewFromFloat(0.00)
	precisionDec := decimal.NewFromFloatWithExponent(getPrecision(unit), exp)
	// 给每一个 bucket 都加入一个最小值，确保每个人至少能领到这个最小值
	buckets = funk.Map(buckets, func(x decimal.Decimal) decimal.Decimal {
		return precisionDec
	}).([]decimal.Decimal)
	amountDec = amountDec.Sub(decimal.Sum(buckets[0], buckets[1:]...))
	// 计算一下 42 轮每轮的 amount
	part := amountDec.DivRound(decimal.NewFromFloat(42.00), int32(unit))
	for k := 0; k < 42; k ++ {
		partDec := part
		tempBuckets := make([]decimal.Decimal, num)
		for i := 0; i < num - 1 && partDec.Cmp(zero) > 0; i++ {
			// pick a random from range [最小值, 每轮的 amount)
			rndDec := decimal.NewFromFloat(rand.Float64())
			inc := rndDec.Mul(partDec).Round(int32(unit))
			// 确保有足够的钱
			if partDec.Sub(inc).Cmp(zero) <= 0 {
				inc = partDec
			}
			tempBuckets[i] = tempBuckets[i].Add(inc)
			partDec = partDec.Sub(inc)
			amountDec = amountDec.Sub(inc)
		}
		// 每一轮中，如果还剩下点，就给最后一个临时 bucket
		if partDec.Cmp(zero) > 0 {
			tempBuckets[num-1] = partDec
		}
		// 洗牌
		shuffledTempBuckets := funk.Shuffle(tempBuckets).([]decimal.Decimal)
		// 添加到 buckets
		for i := 0; i < num; i++ {
			buckets[i] = buckets[i].Add(shuffledTempBuckets[i])
		}
	}
	// 如果还剩下点，随机给一个 bucket
	if amountDec.Cmp(zero) > 0 {
		index := rand.Intn(num)
		buckets[index] = buckets[index].Add(amountDec)
	}
	return buckets
}

func init() {
	rand.Seed(time.Now().UnixNano())
}

// GenerateBuckets returns the a decimal.Dicimal Array according to the provided argus
// 
// NOTE: unit is the last digit that will not be truncated (must be >= 0)
// 
func GenerateBuckets(method int, amount float64, num int, unit int) []decimal.Decimal {
	switch method {
	case MethodEqual:
		return distributeEq(amount, num, unit)
	case MethodFair:
		return distributeFair(amount, num, unit)
	case MethodRand:
		return distributeRand(amount, num, unit)
	default:
		return distributeEq(amount, num, unit)
	}
}
